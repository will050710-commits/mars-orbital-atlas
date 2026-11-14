import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { assetManager } from './KTX2DracoManager';
import { useCosmosStore } from '../../store/useCosmosStore';

export interface BodyPlanetaryTextures {
  albedo: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
  thermalPreview: THREE.Texture;
  elevationPreview: THREE.Texture;
}


/**
 * Deterministic 2D/3D value noise for realistic Martian terrain synthesis
 * (Olympus Mons, Tharsis Rise, Valles Marineris canyon, Hellas basin, Syrtis Major dark basalt, polar ice caps).
 */
function fract(x: number): number {
  return x - Math.floor(x);
}

function hash2D(ix: number, iy: number): number {
  return fract(Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123);
}

function smoothNoise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 5): number {
  let value = 0;
  let amplitude = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise2D(x * freq, y * freq);
    freq *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

/**
 * Computes normalized topological height [-1, 1] at given equirectangular UV (u in [0,1], v in [0,1])
 */
function sampleMarsTopography(u: number, v: number): number {
  const lon = (u - 0.5) * 360; // -180 to +180
  const lat = (0.5 - v) * 180; // +90 (North) to -90 (South)

  // Base planetary dichotomy: Northern lowlands (Vastitas Borealis) vs Southern highlands
  const dichotomy = -0.25 * Math.tanh((lat - 12) / 18);

  // Tharsis bulge around lon = -110 (250E), lat = 5
  const dTharsis = Math.hypot((lon - 46) / 48, (lat - 8) / 36);
  const tharsisBulge = 0.48 * Math.exp(-dTharsis * dTharsis);

  // Olympus Mons shield volcano near lon = 46.2 (226.2E shifted), lat = 18.65
  const dOlympus = Math.hypot((lon - 46.2) / 6.5, (lat - 18.65) / 6.5);
  const olympusPeak = 0.72 * Math.exp(-dOlympus * dOlympus * 2.2);

  // Valles Marineris tectonic canyon near lon = 120.8 (300.8E), lat = -13.9
  const dVallesLon = (lon - 120.8) / 26;
  const dVallesLat = (lat + 13.9 + Math.sin(dVallesLon * 2.5) * 1.8) / 3.2;
  const vallesCanyon =
    Math.abs(dVallesLon) < 1.1
      ? -0.62 * Math.exp(-dVallesLat * dVallesLat * 2.5) * (1 - dVallesLon * dVallesLon * 0.7)
      : 0;

  // Hellas Planitia deep impact basin near lon = -109.5 (70.5E), lat = -42.4
  const dHellas = Math.hypot((lon + 109.5) / 24, (lat + 42.4) / 18);
  const hellasBasin = -0.68 * Math.exp(-dHellas * dHellas * 1.7);

  // Multi-scale crater & ridge roughness
  const n = fbm(u * 14, v * 7, 5) * 0.42 - 0.21;

  return THREE.MathUtils.clamp(
    dichotomy + tharsisBulge + olympusPeak + vallesCanyon + hellasBasin + n,
    -1,
    1,
  );
}

function makeDataTexture(data: Uint8Array, width: number, height: number, isSRGB: boolean): THREE.Texture {
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

function computeNormalMap(heightField: Float32Array, width: number, height: number, bumpStrength: number): Uint8Array {
  const normalData = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const yUp = Math.max(0, y - 1);
    const yDown = Math.min(height - 1, y + 1);
    for (let x = 0; x < width; x++) {
      const xLeft = (x - 1 + width) % width;
      const xRight = (x + 1) % width;
      const dX = (heightField[y * width + xRight] - heightField[y * width + xLeft]) * bumpStrength;
      const dY = (heightField[yDown * width + x] - heightField[yUp * width + x]) * bumpStrength;
      const invLen = 1 / Math.sqrt(dX * dX + dY * dY + 1);
      const nx = (-dX * invLen * 0.5 + 0.5) * 255;
      const ny = (-dY * invLen * 0.5 + 0.5) * 255;
      const nz = (invLen * 0.5 + 0.5) * 255;
      const p4 = (y * width + x) * 4;
      normalData[p4] = Math.round(nx);
      normalData[p4 + 1] = Math.round(ny);
      normalData[p4 + 2] = Math.round(nz);
      normalData[p4 + 3] = 255;
    }
  }
  return normalData;
}

export function generateProceduralMarsTextures(): BodyPlanetaryTextures {

  const width = 1024;
  const height = 512;

  const albedoData = new Uint8Array(width * height * 4);
  const roughnessData = new Uint8Array(width * height * 4);
  const thermalData = new Uint8Array(width * height * 4);
  const molaData = new Uint8Array(width * height * 4);
  const heightField = new Float32Array(width * height);

  // Pass 1: Compute heightfield, Albedo, Roughness, Thermal IR, and MOLA Elevation
  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    const lat = (0.5 - v) * 180;
    const absLat = Math.abs(lat);

    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);
      const idx = y * width + x;
      const p4 = idx * 4;

      const elev = sampleMarsTopography(u, v);
      heightField[idx] = elev;

      const detail = fbm(u * 32 + 5.2, v * 16 + 1.7, 4);
      const darkBasalt = fbm(u * 6.5 + 2.1, v * 4.5 + 8.4, 3);

      // Polar ice caps (North & South CO2/H2O caps)
      const polarFactor = THREE.MathUtils.smoothstep(absLat + detail * 8, 76, 86);

      // Albedo RGB: Rusty iron-oxide ochre, dark basalt plains (Syrtis Major / Acidalia), bright dust, polar ice
      let r = 198 + elev * 34 + (detail - 0.5) * 45;
      let g = 96 + elev * 22 + (detail - 0.5) * 32;
      let b = 52 + elev * 14 + (detail - 0.5) * 24;

      if (darkBasalt > 0.56 && absLat < 58) {
        const basaltMix = THREE.MathUtils.clamp((darkBasalt - 0.56) * 3.2, 0, 0.68);
        r = THREE.MathUtils.lerp(r, 82, basaltMix);
        g = THREE.MathUtils.lerp(g, 54, basaltMix);
        b = THREE.MathUtils.lerp(b, 44, basaltMix);
      }

      // Mix polar ice cap
      r = THREE.MathUtils.lerp(r, 244, polarFactor);
      g = THREE.MathUtils.lerp(g, 240, polarFactor);
      b = THREE.MathUtils.lerp(b, 236, polarFactor);

      albedoData[p4] = THREE.MathUtils.clamp(Math.round(r), 0, 255);
      albedoData[p4 + 1] = THREE.MathUtils.clamp(Math.round(g), 0, 255);
      albedoData[p4 + 2] = THREE.MathUtils.clamp(Math.round(b), 0, 255);
      albedoData[p4 + 3] = 255;

      // Roughness map
      const rough = Math.round(THREE.MathUtils.clamp((0.82 - polarFactor * 0.35 + detail * 0.15) * 255, 60, 250));
      roughnessData[p4] = rough;
      roughnessData[p4 + 1] = rough;
      roughnessData[p4 + 2] = rough;
      roughnessData[p4 + 3] = 255;

      // Thermal IR map (insolation + thermal inertia)
      const insolation = Math.cos(THREE.MathUtils.degToRad(lat)) * 0.75 + (1 - elev * 0.25) * 0.25;
      const tNorm = THREE.MathUtils.clamp(insolation * 0.85 + detail * 0.2, 0, 1);
      thermalData[p4] = Math.round(THREE.MathUtils.clamp(tNorm * 320, 20, 255));
      thermalData[p4 + 1] = Math.round(THREE.MathUtils.clamp((tNorm - 0.3) * 340, 10, 255));
      thermalData[p4 + 2] = Math.round(THREE.MathUtils.clamp((1 - Math.abs(tNorm - 0.35) * 2.2) * 220, 30, 255));
      thermalData[p4 + 3] = 255;

      // MOLA Elevation hypsometric color ramp (Blue -> Cyan -> Green -> Yellow -> Red -> White)
      const hNorm = THREE.MathUtils.clamp((elev + 0.85) / 1.75, 0, 1);
      let mr = 0;
      let mg = 0;
      let mb = 0;
      if (hNorm < 0.25) {
        const k = hNorm / 0.25;
        mr = 20;
        mg = Math.round(40 + k * 180);
        mb = Math.round(160 + k * 85);
      } else if (hNorm < 0.55) {
        const k = (hNorm - 0.25) / 0.3;
        mr = Math.round(30 + k * 210);
        mg = Math.round(220 + k * 25);
        mb = Math.round(245 * (1 - k));
      } else if (hNorm < 0.82) {
        const k = (hNorm - 0.55) / 0.27;
        mr = 245;
        mg = Math.round(235 * (1 - k * 0.75));
        mb = Math.round(35 * (1 - k));
      } else {
        const k = (hNorm - 0.82) / 0.18;
        mr = 250;
        mg = Math.round(60 + k * 195);
        mb = Math.round(40 + k * 215);
      }
      molaData[p4] = mr;
      molaData[p4 + 1] = mg;
      molaData[p4 + 2] = mb;
      molaData[p4 + 3] = 255;
    }
  }

  return {
    albedo: makeDataTexture(albedoData, width, height, true),
    normal: makeDataTexture(computeNormalMap(heightField, width, height, 6.5), width, height, false),
    roughness: makeDataTexture(roughnessData, width, height, false),
    thermalPreview: makeDataTexture(thermalData, width, height, true),
    elevationPreview: makeDataTexture(molaData, width, height, true),
  };
}

export interface BakedMarsWebPSet {
  albedo: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
}

export const MARS_BAKED_WEBP_URLS = {
  albedo: '/assets/textures/mars_albedo_baked.webp',
  normal: '/assets/textures/mars_normals.webp',
  roughness: '/assets/textures/mars_roughness.webp',
} as const;

/**
 * Loads the supplied baked 8K Mars WebP texture suite asynchronously.
 * Callers own disposal of the returned Texture instances.
 */
export async function loadBakedMarsWebPTextures(options?: {
  flipY?: boolean;
  signal?: AbortSignal;
}): Promise<BakedMarsWebPSet> {
  const flipY = options?.flipY ?? true;
  const loader = new THREE.TextureLoader();

  const loadOne = (url: string, isSRGB: boolean) =>
    new Promise<THREE.Texture>((resolve, reject) => {
      if (options?.signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      loader.load(
        url,
        (tex) => {
          tex.flipY = flipY;
          tex.wrapS = THREE.ClampToEdgeWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
          tex.anisotropy = 4;
          tex.needsUpdate = true;
          resolve(tex);
        },
        undefined,
        (err) => reject(err),
      );
    });

  const [albedo, normal, roughness] = await Promise.all([
    loadOne(MARS_BAKED_WEBP_URLS.albedo, true),
    loadOne(MARS_BAKED_WEBP_URLS.normal, false),
    loadOne(MARS_BAKED_WEBP_URLS.roughness, false),
  ]);

  if (options?.signal?.aborted) {
    albedo.dispose();
    normal.dispose();
    roughness.dispose();
    throw new DOMException('Aborted', 'AbortError');
  }

  return { albedo, normal, roughness };
}

/**
 * Generic grayscale crater/maria texture for illustrative lunar display.
 * It does not encode measured imagery, LOLA elevation or real feature positions.
 */
function sampleMoonSurface(u: number, v: number): number {
  const lat = (0.5 - v) * 180;
  const maria = fbm(u * 4.3 + 9.1, v * 3.1 + 2.7, 4);
  const crater = fbm(u * 26 + 4.3, v * 13 + 7.9, 5);
  const fine = fbm(u * 72 + 1.3, v * 36 + 5.1, 3);
  const mariaMask = THREE.MathUtils.smoothstep(maria, 0.52, 0.64) * (0.7 + 0.3 * Math.cos(lat * Math.PI / 180));
  const ridge = Math.abs(fbm(u * 7.5 + 12.4, v * 4.6 + 6.8, 4) - 0.5) * 2;
  return THREE.MathUtils.clamp(0.55 + (crater - 0.5) * 0.55 + (fine - 0.5) * 0.16 - mariaMask * 0.34 + ridge * 0.06, 0, 1);
}

export function generateProceduralMoonTextures(): BodyPlanetaryTextures {
  const width = 1024;
  const height = 512;
  const albedoData = new Uint8Array(width * height * 4);
  const roughnessData = new Uint8Array(width * height * 4);
  const thermalData = new Uint8Array(width * height * 4);
  const elevationData = new Uint8Array(width * height * 4);
  const heightField = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);
      const idx = y * width + x;
      const p4 = idx * 4;
      const shade = sampleMoonSurface(u, v);
      heightField[idx] = shade;

      const gray = Math.round(THREE.MathUtils.clamp(92 + shade * 126, 0, 255));
      albedoData[p4] = gray;
      albedoData[p4 + 1] = gray;
      albedoData[p4 + 2] = Math.round(gray * 0.97);
      albedoData[p4 + 3] = 255;

      const rough = Math.round(THREE.MathUtils.clamp((0.94 - shade * 0.12) * 255, 120, 250));
      roughnessData[p4] = rough;
      roughnessData[p4 + 1] = rough;
      roughnessData[p4 + 2] = rough;
      roughnessData[p4 + 3] = 255;

      // Preview tiles only: not measured temperature or elevation.
      const thermal = Math.round(THREE.MathUtils.clamp(48 + shade * 148, 0, 255));
      thermalData[p4] = thermal;
      thermalData[p4 + 1] = Math.round(thermal * 0.92);
      thermalData[p4 + 2] = Math.round(thermal * 0.82);
      thermalData[p4 + 3] = 255;

      const elevation = Math.round(THREE.MathUtils.clamp(shade * 255, 0, 255));
      elevationData[p4] = elevation;
      elevationData[p4 + 1] = elevation;
      elevationData[p4 + 2] = elevation;
      elevationData[p4 + 3] = 255;
    }
  }

  return {
    albedo: makeDataTexture(albedoData, width, height, true),
    normal: makeDataTexture(computeNormalMap(heightField, width, height, 5.5), width, height, false),
    roughness: makeDataTexture(roughnessData, width, height, false),
    thermalPreview: makeDataTexture(thermalData, width, height, true),
    elevationPreview: makeDataTexture(elevationData, width, height, true),
  };
}

export function useProgressiveMarsTextures(renderer: THREE.WebGLRenderer): BodyPlanetaryTextures {
  const [textures, setTextures] = useState<BodyPlanetaryTextures>(() =>
    generateProceduralMarsTextures(),
  );

  useEffect(() => {
    assetManager.initWithRenderer(renderer);
    const store = useCosmosStore.getState();
    store.reportAssetTaskProgress(
      'mars_surface_maps',
      100,
      'Đã hoàn tất bản đồ bề mặt & quang phổ Sao Hỏa',
    );
    setTextures(generateProceduralMarsTextures());
  }, [renderer]);

  return textures;
}

const CORE_MODEL_PATHS = [
  '/assets/models/moons/phobos_draco.glb',
  '/assets/models/moons/deimos_draco.glb',
  '/assets/models/spacecraft/mars_reconnaissance_orbiter.glb',
  '/assets/models/stations/ares_orbital_station_lod0.glb',
];

let coreModelsPreloadStarted = false;

/**
 * Thực sự tải trước các mô hình .glb nén Draco qua Web Worker và báo cáo tiến độ thật vào Zustand store.
 */
export function preloadCoreSpaceAssets(renderer: THREE.WebGLRenderer): void {
  if (coreModelsPreloadStarted) return;
  coreModelsPreloadStarted = true;

  assetManager.initWithRenderer(renderer);
  const store = useCosmosStore.getState();
  store.reportAssetTaskProgress(
    'decoders_and_models',
    10,
    'Đang giải mã mô hình 3D Draco & bộ nạp KTX2...',
  );

  let completed = 0;
  const total = CORE_MODEL_PATHS.length;

  Promise.allSettled(
    CORE_MODEL_PATHS.map((url) =>
      assetManager.gltfLoader.loadAsync(url).finally(() => {
        completed += 1;
        const pct = Math.round((completed / total) * 100);
        useCosmosStore
          .getState()
          .reportAssetTaskProgress(
            'decoders_and_models',
            pct,
            completed < total
              ? `Đang nạp mô hình tàu & vệ tinh (${completed}/${total})...`
              : 'Đã đồng bộ toàn bộ mô hình 3D & bộ giải mã',
          );
      }),
    ),
  );
}
