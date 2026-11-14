import * as THREE from 'three';
import { GLTFLoader, DRACOLoader, KTX2Loader } from 'three-stdlib';
import { AssetLoadError, classifyAssetError, disposeModel } from './modelResources';

export class AssetStreamManager {
  private static instance: AssetStreamManager;
  public gltfLoader: GLTFLoader;
  public ktx2Loader: KTX2Loader;
  public dracoLoader: DRACOLoader;
  private isInitialized = false;

  private constructor() {
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/decoders/draco/');
    this.dracoLoader.setWorkerLimit(4); // Giải mã hình học trên 4 Web Workers

    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('/decoders/basis/');
    this.ktx2Loader.setWorkerLimit(4); // Transcode KTX2 sang BC7/ASTC trên Worker

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    this.gltfLoader.setKTX2Loader(this.ktx2Loader);
  }

  public static getInstance(): AssetStreamManager {
    if (!AssetStreamManager.instance) {
      AssetStreamManager.instance = new AssetStreamManager();
    }
    return AssetStreamManager.instance;
  }

  public initWithRenderer(renderer: THREE.WebGLRenderer): void {
    if (!this.isInitialized) {
      this.ktx2Loader.detectSupport(renderer);
      this.isInitialized = true;
    }
  }

  /** Lazy, uncached request. Each parse has independent texture-failure accounting. */
  public async loadModel(url: string, signal: AbortSignal, onProgress: (percent?: number) => void): Promise<THREE.Group> {
    let response: Response;
    try { response = await fetch(url, { signal }); }
    catch (error) {
      if (signal.aborted) throw error;
      throw new AssetLoadError('network', 'Không thể kết nối để tải mô hình.');
    }
    if (!response.ok) throw new AssetLoadError(response.status === 404 ? 'missing-file' : 'network', `HTTP ${response.status}: ${url}`);
    const total = Number(response.headers.get('content-length'));
    const chunks: Uint8Array[] = [];
    let received = 0;
    try {
      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value); received += value.byteLength;
          onProgress(total > 0 ? Math.min(100, Math.round(received / total * 100)) : undefined);
        }
      } else {
        const data = new Uint8Array(await response.arrayBuffer());
        chunks.push(data); received = data.length;
      }
    } catch (error) {
      if (signal.aborted) throw error;
      throw new AssetLoadError('network', 'Tải mô hình bị gián đoạn.');
    }
    const bytes = new Uint8Array(received);
    let offset = 0;
    chunks.forEach((chunk) => { bytes.set(chunk, offset); offset += chunk.length; });
    if (received < 20 || new DataView(bytes.buffer).getUint32(0, true) !== 0x46546c67) {
      throw new AssetLoadError('parse', 'Tệp trả về không phải GLB hợp lệ.');
    }
    signal.throwIfAborted();
    const manager = new THREE.LoadingManager();
    let textureFailure = '';
    manager.onError = (resource) => { textureFailure = resource; };
    const loader = new GLTFLoader(manager);
    loader.setDRACOLoader(this.dracoLoader);
    loader.setKTX2Loader(this.ktx2Loader);
    try {
      const gltf = await loader.parseAsync(bytes.buffer, url.slice(0, url.lastIndexOf('/') + 1));
      if (signal.aborted || textureFailure) {
        gltf.scenes.forEach(disposeModel);
        signal.throwIfAborted();
        throw new AssetLoadError('texture', `Không tải được texture: ${textureFailure}`);
      }
      // Imported assets have one scene. Dispose any unused scenes separately.
      gltf.scenes.filter((scene) => scene !== gltf.scene).forEach(disposeModel);
      return gltf.scene;
    } catch (error) {
      if (signal.aborted) throw error;
      throw classifyAssetError(error);
    }
  }
}

export const assetManager = AssetStreamManager.getInstance();
