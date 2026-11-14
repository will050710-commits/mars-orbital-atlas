import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const records = JSON.parse(await fs.readFile(new URL('../src/config/deviceManifest.json', import.meta.url), 'utf8'));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
let count = 0;
for (const record of records) {
  if (record.status !== 'available') {
    if (record.modelPath) throw new Error('Unavailable device has a model URL: ' + record.id);
    continue;
  }
  if (!/^\/assets\/models\/mars\/[a-z0-9_]+\.glb$/.test(record.modelPath)) throw new Error('Unapproved path: ' + record.id);
  const file = new URL('../public' + record.modelPath, import.meta.url);
  const bytes = await fs.readFile(file);
  if (bytes.length !== record.bytes || createHash('sha256').update(bytes).digest('hex') !== record.sha256) throw new Error('Asset integrity mismatch: ' + record.id);
  if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) throw new Error('Invalid GLB: ' + record.id);
  const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  if ((json.scenes?.length ?? 0) !== 1) throw new Error('Review multi-scene resource ownership: ' + record.id);
  if ([...(json.buffers ?? []), ...(json.images ?? [])].some((item) => item.uri)) throw new Error('Unexpected external resource: ' + record.id);
  const doc = await io.read(file.pathname.replace(/^\/([A-Z]:)/i, '$1'));
  let vertices = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const position = primitive.getAttribute('POSITION');
      if (!position) throw new Error('Missing vertex positions: ' + record.id);
      const array = position.getArray();
      if (!array?.every(Number.isFinite)) throw new Error('Non-finite geometry: ' + record.id);
      vertices += position.getCount();
    }
  }
  if (!vertices) throw new Error('Empty model: ' + record.id);
  console.log(record.id + ': valid GLB, ' + vertices + ' vertices, ' + doc.getRoot().listTextures().length + ' textures, ' + bytes.length + ' bytes, SHA-256 verified');
  count++;
}
console.log('Validated ' + count + ' loadable models.');
