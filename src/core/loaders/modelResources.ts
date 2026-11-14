import { Box3, Group, Mesh, Texture, Vector3, type Material, type Object3D, type BufferGeometry } from 'three';

/** Owns only resources from one uncached GLTF parse, never a shared scene clone. */
export function disposeModel(root: Object3D): void {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const images = new Set<{ close?: () => void }>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
    }
    if ('skeleton' in object) (object as Mesh & { skeleton: { dispose: () => void } }).skeleton.dispose();
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => { images.add(texture.source.data); texture.dispose(); });
  images.forEach((bitmap) => bitmap?.close?.());
}

export function normalizePreview(root: Object3D): Group {
  root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(root);
  const size = bounds.getSize(new Vector3());
  const longest = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(longest) || longest <= 0) throw new Error('Model has empty or invalid bounds');
  const offset = new Group();
  offset.position.copy(bounds.getCenter(new Vector3())).negate();
  offset.add(root);
  const normalized = new Group();
  normalized.scale.setScalar(2 / longest);
  normalized.add(offset);
  return normalized;
}

export type AssetErrorKind = 'missing-file' | 'network' | 'parse' | 'decoder' | 'texture';
export class AssetLoadError extends Error {
  constructor(public readonly kind: AssetErrorKind, message: string) { super(message); }
}

export function classifyAssetError(error: unknown): AssetLoadError {
  if (error instanceof AssetLoadError) return error;
  const detail = error instanceof Error ? error.message : String(error);
  const kind = /draco|ktx2|basis|decoder|transcod|wasm|worker/i.test(detail) ? 'decoder'
    : /texture|image|bitmap/i.test(detail) ? 'texture' : 'parse';
  return new AssetLoadError(kind, detail);
}
