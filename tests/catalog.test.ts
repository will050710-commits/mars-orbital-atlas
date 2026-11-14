import test from 'node:test';
import assert from 'node:assert/strict';
import { BODY_CATALOG } from '../src/config/bodyCatalog';
import { ATLAS_POIS, latLonToBodyVector } from '../src/config/atlasPOIs';
import { DEVICE_CATALOG } from '../src/config/deviceCatalog';
import { ORBITAL_ACTORS_CATALOG, computeOrbitalPosition } from '../src/config/celestialCatalog';
import { validateCatalog } from '../src/config/validateCatalog';
import { useCosmosStore } from '../src/store/useCosmosStore';
import { buildSafeWarpSpline } from '../src/core/camera/warpPaths';
import { Vector3 } from 'three';

test('catalog IDs, sources, units, transforms and availability are valid', () => {
  validateCatalog(Object.values(BODY_CATALOG), ATLAS_POIS, DEVICE_CATALOG);
  const available = DEVICE_CATALOG.filter((device) => device.status === 'available');
  assert.equal(available.length, 10);
  for (const id of ['pioneer_10', 'kepler_space_telescope', 'dawn_spacecraft', 'near_shoemaker', 'mro_orbiter']) {
    assert.equal(DEVICE_CATALOG.find((device) => device.id === id)?.status, 'available');
  }
  for (const id of ['curiosity_rover', 'perseverance_rover']) {
    const dev = DEVICE_CATALOG.find((device) => device.id === id);
    assert.equal(dev?.modelPath, undefined);
    assert.equal(dev?.proceduralModel, 'mars_rover_rtg');
  }
  for (const device of available) {
    if (device.id === 'mro_orbiter') {
      assert.equal(device.attributionPath, undefined);
    } else {
      assert.equal(device.attributionPath, '/assets/attribution/Mars-Attributions.txt');
    }
  }
  for (const device of DEVICE_CATALOG.filter((item) => item.status === 'unavailable')) {
    assert.equal(device.attributionPath, undefined);
  }
});

test('orbital actors catalog covers Mars moons/orbiters and Moon orbiters with valid Kepler elements', () => {
  const marsOrbiters = ORBITAL_ACTORS_CATALOG.filter((actor) => actor.bodyId === 'mars');
  const moonOrbiters = ORBITAL_ACTORS_CATALOG.filter((actor) => actor.bodyId === 'moon');
  assert.deepEqual(
    marsOrbiters.map((actor) => actor.id),
    ['phobos', 'deimos', 'mro_orbiter', 'mars_odyssey', 'maven_orbiter', 'dawn_flyby', 'ares_station'],
  );
  assert.deepEqual(moonOrbiters.map((actor) => actor.id), ['lro_orbiter', 'apollo_csm']);
  for (const actor of ORBITAL_ACTORS_CATALOG) {
    assert.ok(actor.orbitalElements);
    const pos = computeOrbitalPosition(actor.orbitalElements, 3600);
    assert.ok(Number.isFinite(pos.x) && Number.isFinite(pos.y) && Number.isFinite(pos.z));
    assert.ok(pos.length() > BODY_CATALOG[actor.bodyId!].radiusKm * 1.05);
  }
});

test('Moon body, POIs and Apollo records are source-backed and unloadable', () => {
  const moon = BODY_CATALOG.moon;
  assert.equal(moon.radiusKm, 1737.4);
  assert.equal(moon.rotationSeconds, 2360592);
  assert.match(moon.source.url, /moonfact/);
  const moonPois = ATLAS_POIS.filter((poi) => poi.bodyId === 'moon');
  assert.deepEqual(moonPois.map((poi) => poi.id), ['mare_tranquillitatis', 'tycho', 'south_pole_aitken']);
  const mare = moonPois[0];
  assert.equal(mare.coordinates?.lat, 8.35);
  assert.equal(mare.coordinates?.lon, 30.83);
  assert.equal(mare.source?.url, 'https://planetarynames.wr.usgs.gov/Feature/3691');
  const tycho = moonPois[1];
  assert.equal(tycho.coordinates?.lat, -43.30);
  assert.equal(tycho.coordinates?.lon, 348.78);
  assert.equal(tycho.source?.url, 'https://planetarynames.wr.usgs.gov/Feature/6163');
  const spa = moonPois[2];
  assert.equal(spa.coordinates?.lat, -53);
  assert.equal(spa.coordinates?.lon, 191);
  assert.match(spa.source?.url ?? '', /the-moons-largest-basin/);
  const moonDevices = DEVICE_CATALOG.filter((device) => device.bodyId === 'moon');
  assert.equal(moonDevices.length, 6);
  for (const device of moonDevices) {
    assert.equal(device.status, 'unavailable');
    assert.equal(device.modelPath, undefined);
    assert.equal(device.bytes, undefined);
    assert.equal(device.sha256, undefined);
    assert.equal(device.attributionPath, undefined);
    assert.match(device.source.url, /apollo-equipment\.csv/);
  }
});

test('invalid catalog fixtures fail instead of exposing nonexistent models', () => {
  assert.throws(() => validateCatalog(Object.values(BODY_CATALOG), ATLAS_POIS, [...DEVICE_CATALOG, DEVICE_CATALOG[0]]), /duplicate/);
  assert.throws(() => validateCatalog(Object.values(BODY_CATALOG), ATLAS_POIS, [{ ...DEVICE_CATALOG[0], status: 'unavailable' }]), /unavailable/);
  assert.throws(() => validateCatalog(Object.values(BODY_CATALOG), [{ ...ATLAS_POIS[0], coordinates: { lat: 91, lon: 0, height: 0 } }], DEVICE_CATALOG), /POI/);
  const moonDevice = DEVICE_CATALOG.find((device) => device.bodyId === 'moon')!;
  assert.throws(() => validateCatalog(Object.values(BODY_CATALOG), ATLAS_POIS, [{ ...moonDevice, modelPath: '/assets/models/moon/none.glb' }]), /unavailable/);
  assert.throws(() => validateCatalog([{ ...BODY_CATALOG.moon, target: { ...BODY_CATALOG.moon.target, bodyId: 'mars' } }], ATLAS_POIS, DEVICE_CATALOG), /target/);
});

test('geographic conversion has correct axes, hemispheres and radius', () => {
  assert.ok(latLonToBodyVector(0, 0, 10).distanceTo(new Vector3(10, 0, 0)) < 1e-10);
  assert.ok(latLonToBodyVector(0, 90, 10).distanceTo(new Vector3(0, 0, -10)) < 1e-10);
  assert.ok(latLonToBodyVector(90, 137, 10).distanceTo(new Vector3(0, 10, 0)) < 1e-10);
  assert.ok(latLonToBodyVector(-30, 300, 10).y < 0);
  assert.ok(Math.abs(latLonToBodyVector(-30, 300, 10).length() - 10) < 1e-10);
});

test('globe flights do not cross either body, including antipodal targets', () => {
  for (const body of Object.values(BODY_CATALOG)) {
    for (const poi of ATLAS_POIS.filter((item) => item.bodyId === body.id)) {
      const start = poi.position.clone().normalize().multiplyScalar(-body.radiusKm * 1.1);
      const { curve, endPosition } = buildSafeWarpSpline(start, poi, body.radiusKm);
      for (const point of curve.getPoints(200)) assert.ok(point.length() > body.radiusKm);
      assert.ok(curve.getPoint(1).distanceTo(endPosition) < 1e-6);
    }
  }
});

test('Mars → Moon → Mars switching resets body-scoped state and isolates stale loads', () => {
  const store = useCosmosStore;
  store.getState().selectBody('mars');
  store.getState().selectDevice('viking_lander');
  assert.equal(store.getState().activeDeviceId, 'viking_lander');
  store.getState().selectBody('moon');
  assert.equal(store.getState().activeBodyId, 'moon');
  assert.equal(store.getState().activeDeviceId, null);
  assert.equal(store.getState().activeTarget, null);
  assert.equal(store.getState().assetLoad.status, 'idle');
  assert.equal(store.getState().viewStage, 'ORBITAL_OVERVIEW');
  store.getState().selectTarget(ATLAS_POIS.find((poi) => poi.id === 'tycho')!);
  assert.equal(store.getState().activeTarget?.id, 'tycho');
  assert.equal(store.getState().viewStage, 'WARPING');
  store.getState().selectDevice('apollo_lrv');
  assert.equal(store.getState().activeDeviceId, 'apollo_lrv');
  assert.equal(store.getState().assetLoad.status, 'unavailable');
  assert.equal(store.getState().viewStage, 'ORBITAL_OVERVIEW');
  store.getState().setAssetLoad('viking_lander', { status: 'ready' });
  assert.equal(store.getState().assetLoad.status, 'unavailable');
  store.getState().selectBody('mars');
  assert.equal(store.getState().activeBodyId, 'mars');
  assert.equal(store.getState().activeDeviceId, null);
  assert.equal(store.getState().assetLoad.status, 'idle');
  assert.equal(store.getState().viewStage, 'ORBITAL_OVERVIEW');
  store.getState().selectDevice('viking_lander');
  assert.equal(store.getState().assetLoad.status, 'loading');
  store.getState().returnToOrbit();
  assert.equal(store.getState().assetLoad.status, 'idle');
});

test('selection, unavailable assets, stale load reports and unavailable layers', () => {
  const store = useCosmosStore;
  store.getState().selectBody('mars');
  store.getState().selectDevice('viking_lander');
  assert.equal(store.getState().assetLoad.status, 'loading');
  store.getState().selectDevice('curiosity_rover');
  assert.equal(store.getState().viewStage, 'ORBITAL_OVERVIEW');
  store.getState().setAssetLoad('viking_lander', { status: 'ready' });
  assert.equal(store.getState().assetLoad.status, 'unavailable');
  store.getState().setSpectralMode('MOLA_ELEVATION');
  assert.equal(store.getState().spectralMode, 'MOLA_ELEVATION');
  store.getState().setSpectralMode('TERRAIN_MESH_3D');
  assert.equal(store.getState().spectralMode, 'TERRAIN_MESH_3D');
  assert.equal(store.getState().viewStage, 'SUB_SCENE');

  // Moon continues to keep unmeasured spectral/terrain modes disabled
  store.getState().selectBody('moon');
  store.getState().setSpectralMode('MOLA_ELEVATION');
  assert.equal(store.getState().spectralMode, 'VISUAL_RGB');
  store.getState().setSpectralMode('TERRAIN_MESH_3D');
  assert.equal(store.getState().spectralMode, 'VISUAL_RGB');

  store.getState().selectBody('mars');
  store.getState().selectTarget(ATLAS_POIS[0]);
  store.getState().enterSurfaceLanding();
  assert.notEqual(store.getState().viewStage, 'SURFACE_CESIUM');
  store.getState().returnToOrbit();
  assert.equal(store.getState().activeDeviceId, null);
  assert.equal(store.getState().assetLoad.status, 'idle');
});
