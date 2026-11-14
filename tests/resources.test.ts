import test from 'node:test';
import assert from 'node:assert/strict';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Texture } from 'three';
import { AssetLoadError, classifyAssetError, disposeModel, normalizePreview } from '../src/core/loaders/modelResources';
import { assetManager } from '../src/core/loaders/AssetStreamManager';

test('model disposal releases shared geometry/material/texture exactly once', () => {
  const geometry = new BoxGeometry();
  const texture = new Texture();
  let closed = 0;
  texture.source.data = { close: () => closed++ };
  const material = new MeshStandardMaterial({ map: texture, normalMap: texture });
  const root = new Group().add(new Mesh(geometry, material), new Mesh(geometry, material));
  const counts = [0, 0, 0];
  [geometry, material, texture].forEach((item, i) => item.addEventListener('dispose', () => counts[i]++));
  disposeModel(root);
  assert.deepEqual(counts, [1, 1, 1]);
  assert.equal(closed, 1);
});

test('inspection normalization is bounded and rejects empty scenes', () => {
  const root = new Mesh(new BoxGeometry(4, 2, 1), new MeshStandardMaterial());
  const normalized = normalizePreview(root);
  assert.equal(normalized.scale.x, 0.5);
  assert.throws(() => normalizePreview(new Group()), /empty/);
  disposeModel(root);
});

test('decoder and texture failure messages remain distinct', () => {
  assert.equal(classifyAssetError(new Error('DRACO decoder failed')).kind, 'decoder');
  assert.equal(classifyAssetError(new Error('image bitmap failed')).kind, 'texture');
  assert.equal(classifyAssetError(new Error('Unexpected token')).kind, 'parse');
});

test('network, missing-file and invalid GLB responses reject without success', async () => {
  const original = globalThis.fetch;
  try {
    for (const [response, kind] of [[new Response('', { status: 404 }), 'missing-file'], [new Response('<html>fallback</html>'), 'parse']] as const) {
      globalThis.fetch = async () => response;
      await assert.rejects(assetManager.loadModel('/model.glb', new AbortController().signal, () => {}), (error: unknown) => error instanceof AssetLoadError && error.kind === kind);
    }
    globalThis.fetch = async () => { throw new TypeError('Offline'); };
    await assert.rejects(assetManager.loadModel('/model.glb', new AbortController().signal, () => {}), (error: unknown) => error instanceof AssetLoadError && error.kind === 'network');
  } finally { globalThis.fetch = original; }
});
