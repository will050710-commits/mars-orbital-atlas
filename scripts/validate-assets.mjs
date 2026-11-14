import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const records = JSON.parse(await fs.readFile(new URL('../src/config/deviceManifest.json', import.meta.url), 'utf8'));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
async function validateGlbFile(id, modelPath, expectedBytes, expectedSha256) {
  const file = new URL('../public' + modelPath, import.meta.url);
  const bytes = await fs.readFile(file);
  if (expectedBytes !== undefined && expectedSha256 !== undefined) {
    if (bytes.length !== expectedBytes || createHash('sha256').update(bytes).digest('hex') !== expectedSha256) {
      throw new Error('Asset integrity mismatch: ' + id);
    }
  }
  if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) {
    throw new Error('Invalid GLB: ' + id);
  }
  const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  if ((json.scenes?.length ?? 0) !== 1) throw new Error('Review multi-scene resource ownership: ' + id);
  if ([...(json.buffers ?? []), ...(json.images ?? [])].some((item) => item.uri)) {
    throw new Error('Unexpected external resource: ' + id);
  }
  const doc = await io.read(file.pathname.replace(/^\/([A-Z]:)/i, '$1'));
  let vertices = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const position = primitive.getAttribute('POSITION');
      if (!position) throw new Error('Missing vertex positions: ' + id);
      const array = position.getArray();
      if (!array?.every(Number.isFinite)) throw new Error('Non-finite geometry: ' + id);
      vertices += position.getCount();
    }
  }
  if (!vertices) throw new Error('Empty model: ' + id);
  console.log(
    id + ': valid GLB, ' + vertices + ' vertices, ' + doc.getRoot().listTextures().length + ' textures, ' + bytes.length + ' bytes' + (expectedSha256 ? ', SHA-256 verified' : '')
  );
}

let count = 0;
for (const record of records) {
  if (record.status !== 'available') {
    if (record.modelPath) throw new Error('Unavailable device has a model URL: ' + record.id);
    continue;
  }
  if (!/^\/assets\/models\/mars\/[a-z0-9_]+\.glb$/.test(record.modelPath)) throw new Error('Unapproved path: ' + record.id);
  await validateGlbFile(record.id, record.modelPath, record.bytes, record.sha256);
  count++;
}

const orbitalAssets = [
  ['mars_odyssey', '/assets/models/mars/mars_odyssey.glb'],
  ['maven_orbiter', '/assets/models/mars/maven_orbiter.glb'],
  ['mars_terrain', '/assets/models/mars/mars_terrain.glb'],
  ['phobos', '/assets/models/moons/phobos.glb'],
  ['deimos', '/assets/models/moons/deimos.glb'],
  ['lro_orbiter', '/assets/models/moons/lro_orbiter.glb'],
  ['apollo_csm', '/assets/models/moons/apollo_csm.glb'],
  ['moon_terrain', '/assets/models/moons/moon_terrain.glb'],
  ['ares_station', '/assets/models/stations/ares_orbital_station.glb'],
];

for (const [id, modelPath] of orbitalAssets) {
  await validateGlbFile(id, modelPath);
  count++;
}

console.log('Validated ' + count + ' loadable models.');
