import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { DEVICE_CATALOG } from '../src/config/deviceCatalog';
import { ORBITAL_ACTORS_CATALOG } from '../src/config/celestialCatalog';
import { DEVICE_DOSSIERS, getDossierById } from '../src/config/deviceDossiers';
import {
  CURIOSITY_ALL_NODES,
  DEVICE_CONTROL_SPECS,
  INGENUITY_ALL_NODES,
  INSIGHT_ALL_NODES,
  PERSEVERANCE_ALL_NODES,
  getDeviceControlSpec,
} from '../src/config/deviceControlSpecs';
import { validateDeviceControlSpecs } from '../src/config/validateCatalog';
import {
  applyCoaxialRotorRotation,
  applyDevicePartHighlight,
  getDeviceNodeMap,
  getWorldAxisForLocalDirection,
  prepareControlledDeviceScene,
} from '../src/scene/spacecraft/deviceControlRuntime';
import { useCosmosStore } from '../src/store/useCosmosStore';

test('Ingenuity GLB binary nodes match documented control spec node map', () => {
  const glbPath = path.resolve(process.cwd(), 'public/assets/models/mars/ingenuity_helicopter.glb');
  const glb = fs.readFileSync(glbPath);
  assert.equal(glb.toString('utf8', 0, 4), 'glTF');
  const jsonLength = glb.readUInt32LE(12);
  const chunkType = glb.readUInt32LE(16);
  assert.equal(chunkType, 0x4e4f534a); // "JSON"
  const gltf = JSON.parse(glb.toString('utf8', 20, 20 + jsonLength)) as {
    nodes?: Array<{ name?: string }>;
  };
  const glbNodeNames = (gltf.nodes ?? [])
    .map((node) => node.name)
    .filter((name): name is string => Boolean(name))
    .sort();
  assert.deepEqual(glbNodeNames, [...INGENUITY_ALL_NODES].sort());
});

test('InSight GLB binary nodes match verified 83-node control spec map', () => {
  const glbPath = path.resolve(process.cwd(), 'public/assets/models/mars/insight_lander.glb');
  const glb = fs.readFileSync(glbPath);
  const jsonLength = glb.readUInt32LE(12);
  const gltf = JSON.parse(glb.toString('utf8', 20, 20 + jsonLength)) as {
    nodes?: Array<{ name?: string }>;
  };
  const glbNodeNames = (gltf.nodes ?? [])
    .map((node) => node.name)
    .filter((name): name is string => Boolean(name))
    .sort();
  assert.equal(glbNodeNames.length, 83);
  assert.deepEqual(glbNodeNames, [...INSIGHT_ALL_NODES].sort());

  const insightSpec = getDeviceControlSpec('insight_lander');
  assert.ok(insightSpec);
  assert.equal(insightSpec.cameraViews.length, 4);
  assert.ok(insightSpec.partGroups.some((group) => group.id === 'robotic_arm'));
  assert.ok(insightSpec.partGroups.some((group) => group.id === 'solar_wings'));
});

test('Perseverance and Curiosity GLB binary nodes match documented control spec node maps', () => {
  const parseNodeNames = (relPath: string) => {
    const glbPath = path.resolve(process.cwd(), relPath);
    const glb = fs.readFileSync(glbPath);
    assert.equal(glb.toString('utf8', 0, 4), 'glTF');
    const jsonLength = glb.readUInt32LE(12);
    const chunkType = glb.readUInt32LE(16);
    assert.equal(chunkType, 0x4e4f534a);
    const gltf = JSON.parse(glb.toString('utf8', 20, 20 + jsonLength)) as {
      nodes?: Array<{ name?: string }>;
    };
    return (gltf.nodes ?? [])
      .map((node) => node.name)
      .filter((name): name is string => Boolean(name))
      .sort();
  };

  const perseveranceNodes = parseNodeNames('public/assets/models/mars/perseverance_rover.glb');
  assert.equal(perseveranceNodes.length, 66);
  assert.deepEqual(perseveranceNodes, [...PERSEVERANCE_ALL_NODES].sort());
  const perseveranceSpec = getDeviceControlSpec('perseverance_rover');
  assert.ok(perseveranceSpec);
  assert.equal(perseveranceSpec.cameraViews.length, 4);
  assert.ok(perseveranceSpec.partGroups.some((group) => group.id === 'optics_mast'));
  assert.ok(perseveranceSpec.partGroups.some((group) => group.id === 'robotic_arm'));
  assert.ok(perseveranceSpec.partGroups.some((group) => group.id === 'mobility_chassis'));
  assert.ok(perseveranceSpec.partGroups.some((group) => group.id === 'power_thermal'));

  const curiosityNodes = parseNodeNames('public/assets/models/mars/curiosity_rover.glb');
  assert.deepEqual(curiosityNodes, [...CURIOSITY_ALL_NODES].sort());
  const curiositySpec = getDeviceControlSpec('curiosity_rover');
  assert.ok(curiositySpec);
  assert.equal(curiositySpec.cameraViews.length, 4);
  assert.equal(curiositySpec.partGroups.length, 1);
  assert.equal(curiositySpec.partGroups[0].id, 'all');
});

test('Control Room POV and Option 1/Option 2 mode state clamps orientation and resets across transitions', () => {
  const store = useCosmosStore.getState();
  store.selectBody('mars');
  store.selectDevice('curiosity_rover');
  assert.equal(useCosmosStore.getState().inspectionMode, 'MODEL_CLOSEUP');

  store.setInspectionMode('CONTROL_ROOM_POV');
  assert.equal(useCosmosStore.getState().inspectionMode, 'CONTROL_ROOM_POV');
  assert.equal(useCosmosStore.getState().viewStage, 'SUB_SCENE');

  store.setPovOrientation(240, -90);
  assert.equal(useCosmosStore.getState().povYawDeg, 180);
  assert.equal(useCosmosStore.getState().povPitchDeg, -45);

  store.setPovFovZoom(4);
  store.setPovSensorMode('THERMAL_FALSE');
  assert.equal(useCosmosStore.getState().povFovZoom, 4);
  assert.equal(useCosmosStore.getState().povSensorMode, 'THERMAL_FALSE');

  store.resetPovCamera();
  assert.equal(useCosmosStore.getState().povYawDeg, 0);
  assert.equal(useCosmosStore.getState().povPitchDeg, -8);
  assert.equal(useCosmosStore.getState().povFovZoom, 1);

  store.toggleOrbits();
  assert.equal(useCosmosStore.getState().showOrbits, false);
  store.toggleOrbits();
  assert.equal(useCosmosStore.getState().showOrbits, true);

  store.returnToOrbit();
  assert.equal(useCosmosStore.getState().inspectionMode, 'MODEL_CLOSEUP');
});

test('validateDeviceControlSpecs accepts verified Ingenuity spec and rejects invalid fixtures', () => {
  assert.doesNotThrow(() => validateDeviceControlSpecs(DEVICE_CATALOG, DEVICE_CONTROL_SPECS));

  const spec = getDeviceControlSpec('ingenuity_helicopter');
  assert.ok(spec);
  assert.equal(getDeviceControlSpec('unknown_device'), null);
  assert.equal(getDeviceControlSpec(null), null);
  assert.equal(spec.cameraViews.length, 4);
  assert.ok(spec.cameraViews.every((view) => view.isIllustrativeView));

  const mappedNodes = new Set(spec.partGroups.flatMap((group) => group.nodeNames));
  for (const nodeName of INGENUITY_ALL_NODES) {
    assert.ok(mappedNodes.has(nodeName), `Missing GLB node in partGroups: ${nodeName}`);
  }

  assert.throws(
    () =>
      validateDeviceControlSpecs(DEVICE_CATALOG, {
        apollo_11_lrr: { ...spec, deviceId: 'apollo_11_lrr' },
      }),
    /unavailable or unknown/,
  );

  assert.throws(
    () =>
      validateDeviceControlSpecs(DEVICE_CATALOG, {
        wrong_key: spec,
      }),
    /Mismatched device control key/,
  );

  assert.throws(
    () =>
      validateDeviceControlSpecs(DEVICE_CATALOG, {
        ingenuity_helicopter: {
          ...spec,
          cameraViews: spec.cameraViews.map((view, idx) =>
            idx === 0 ? { ...view, position: [...view.target] as [number, number, number] } : view,
          ),
        },
      }),
    /Degenerate camera view distance/,
  );

  assert.throws(
    () =>
      validateDeviceControlSpecs(DEVICE_CATALOG, {
        ingenuity_helicopter: {
          ...spec,
          partGroups: spec.partGroups.filter((group) => group.id === 'solar_power'),
        },
      }),
    /Rotor control nodes missing from partGroups/,
  );
});

test('device control store transitions, step spin override and context switches reset cleanly', () => {
  const store = useCosmosStore.getState();
  store.selectBody('mars');
  store.selectDevice('ingenuity_helicopter');
  assert.equal(useCosmosStore.getState().activeDeviceId, 'ingenuity_helicopter');
  assert.equal(useCosmosStore.getState().deviceCameraViewId, 'overview');
  assert.equal(useCosmosStore.getState().activePartGroupId, 'all');
  assert.equal(useCosmosStore.getState().rotorSpinMode, 'stopped');
  assert.equal(useCosmosStore.getState().rotorStepDeg, 0);

  const tickBefore = useCosmosStore.getState().deviceCameraTick;
  store.setDeviceCameraView('rte_horizon');
  assert.equal(useCosmosStore.getState().deviceCameraViewId, 'rte_horizon');
  assert.equal(useCosmosStore.getState().deviceCameraTick, tickBefore + 1);

  store.setActivePartGroup('cameras_optics');
  store.setRotorSpinMode('demo_slow');
  assert.equal(useCosmosStore.getState().rotorSpinMode, 'demo_slow');

  // Discrete step command must stop slow demo spin so the chosen step stays fixed
  const stepTickBefore = useCosmosStore.getState().rotorStepTick;
  store.setRotorStepDeg(90);
  assert.equal(useCosmosStore.getState().rotorSpinMode, 'stopped');
  assert.equal(useCosmosStore.getState().rotorStepDeg, 90);
  assert.equal(useCosmosStore.getState().rotorStepTick, stepTickBefore + 1);

  store.resetDeviceControl();
  assert.equal(useCosmosStore.getState().deviceCameraViewId, 'overview');
  assert.equal(useCosmosStore.getState().activePartGroupId, 'all');
  assert.equal(useCosmosStore.getState().rotorSpinMode, 'stopped');
  assert.equal(useCosmosStore.getState().rotorStepDeg, 0);

  store.setDeviceCameraView('navcam_nadir');
  store.setRotorSpinMode('demo_slow');
  store.selectBody('moon');
  assert.equal(useCosmosStore.getState().activeBodyId, 'moon');
  assert.equal(useCosmosStore.getState().activeDeviceId, null);
  assert.equal(useCosmosStore.getState().deviceCameraViewId, 'overview');
  assert.equal(useCosmosStore.getState().rotorSpinMode, 'stopped');

  store.selectBody('mars');
  store.selectDevice('ingenuity_helicopter');
  store.setActivePartGroup('landing_gear');
  store.returnToOrbit();
  assert.equal(useCosmosStore.getState().activeDeviceId, null);
  assert.equal(useCosmosStore.getState().activePartGroupId, 'all');
});

test('runtime helpers isolate shared materials and apply opposite-sense coaxial rotor spin', () => {
  const spec = getDeviceControlSpec('ingenuity_helicopter');
  assert.ok(spec?.rotorControl);

  const root = new Group();
  const geometry = new BoxGeometry(0.1, 0.1, 0.1);
  const sharedMaterial = new MeshStandardMaterial({ color: 0x333333 });

  const busGroup = new Group();
  busGroup.name = 'bus';
  const busMesh = new Mesh(geometry, sharedMaterial);
  busGroup.add(busMesh);

  const camsGroup = new Group();
  camsGroup.name = 'cams';
  const camsMesh = new Mesh(geometry, sharedMaterial);
  camsGroup.add(camsMesh);

  // Align local [1, 0, 0] to world +Y on upper rotor and world -Y on lower rotor, matching NASA GLB pivots
  const upperRotor = new Group();
  upperRotor.name = 'rotors_01';
  upperRotor.quaternion.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
  upperRotor.add(new Mesh(geometry, sharedMaterial));

  const lowerRotor = new Group();
  lowerRotor.name = 'rotors_02';
  lowerRotor.quaternion.setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2);
  lowerRotor.add(new Mesh(geometry, sharedMaterial));

  root.add(busGroup, camsGroup, upperRotor, lowerRotor);

  const nodeMap = prepareControlledDeviceScene(root);
  assert.deepEqual(Object.keys(getDeviceNodeMap(root)).sort(), ['bus', 'cams', 'rotors_01', 'rotors_02']);
  assert.deepEqual(Object.keys(nodeMap).sort(), ['bus', 'cams', 'rotors_01', 'rotors_02']);
  assert.notEqual(busMesh.material, camsMesh.material);
  assert.notEqual(busMesh.material, sharedMaterial);

  const upperAxis = getWorldAxisForLocalDirection(upperRotor, spec.rotorControl.localAxis);
  const lowerAxis = getWorldAxisForLocalDirection(lowerRotor, spec.rotorControl.localAxis);
  assert.ok(upperAxis.y > 0.99);
  assert.ok(lowerAxis.y < -0.99);
  assert.ok(upperAxis.dot(lowerAxis) < -0.99);

  // Verify counter-rotation in XZ plane from an identical +90 deg rotation around local [1, 0, 0]
  const restUpperQuat = upperRotor.quaternion.clone();
  const restLowerQuat = lowerRotor.quaternion.clone();
  const forwardProbe = new Vector3(0, 0, 1);

  applyCoaxialRotorRotation(nodeMap, spec.rotorControl, Math.PI / 2);
  const upperMovedZ = forwardProbe.clone().applyQuaternion(upperRotor.quaternion).applyQuaternion(restUpperQuat.clone().invert());
  const lowerMovedZ = forwardProbe.clone().applyQuaternion(lowerRotor.quaternion).applyQuaternion(restLowerQuat.clone().invert());
  // Around local X, upperRotor (+Y world) and lowerRotor (-Y world) trace opposite XZ headings
  const upperWorldHeading = forwardProbe.clone().applyQuaternion(upperRotor.quaternion);
  const lowerWorldHeading = forwardProbe.clone().applyQuaternion(lowerRotor.quaternion);
  assert.ok(Math.abs(upperWorldHeading.x + lowerWorldHeading.x) < 1e-6);
  assert.ok(Math.abs(upperWorldHeading.x) > 0.99);
  assert.ok(upperMovedZ.length() > 0.99 && lowerMovedZ.length() > 0.99);

  // Reset angle back to 0 restores exact rest quaternions
  applyCoaxialRotorRotation(nodeMap, spec.rotorControl, 0);
  assert.ok(upperRotor.quaternion.angleTo(restUpperQuat) < 1e-6);
  assert.ok(lowerRotor.quaternion.angleTo(restLowerQuat) < 1e-6);

  // Highlighting cams keeps cams opaque while fading bus without leaking through shared source material
  applyDevicePartHighlight(root, spec, 'cameras_optics');
  const busMat = busMesh.material as MeshStandardMaterial;
  const camsMat = camsMesh.material as MeshStandardMaterial;
  assert.equal(camsMat.transparent, false);
  assert.equal(camsMat.opacity, 1);
  assert.ok(camsMat.emissive.getHex() > 0);
  assert.equal(busMat.transparent, true);
  assert.equal(busMat.opacity, 0.16);
  assert.equal(busMat.depthWrite, false);

  // Selecting 'all' restores unaltered material state
  applyDevicePartHighlight(root, spec, 'all');
  assert.equal(busMat.transparent, false);
  assert.equal(busMat.opacity, 1);
  assert.equal(busMat.depthWrite, true);
  assert.equal(camsMat.emissive.getHex(), 0);
  assert.equal(camsMat.emissiveIntensity, 1);

  geometry.dispose();
  sharedMaterial.dispose();
  root.traverse((obj) => {
    if ('isMesh' in obj && (obj as Mesh).isMesh) {
      const mat = (obj as Mesh).material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
  });
});

test('DEVICE_DOSSIERS covers all 18 catalog devices and all orbital actors with complete mission data', () => {
  assert.equal(DEVICE_CATALOG.length, 18);
  for (const device of DEVICE_CATALOG) {
    const dossier = getDossierById(device.id);
    assert.ok(dossier, `Missing dossier for device ${device.id}`);
    assert.ok(dossier.biography.trim().length > 20, `Empty biography for ${device.id}`);
    assert.ok(dossier.technicalSpecs.length >= 2, `Expected technicalSpecs for ${device.id}`);
    assert.ok(dossier.measuredData.length >= 1, `Expected measuredData for ${device.id}`);
    assert.ok(dossier.contributions.length >= 1, `Expected contributions for ${device.id}`);
    assert.ok(dossier.modelDisclaimer.trim().length > 10, `Missing modelDisclaimer for ${device.id}`);
  }

  for (const actor of ORBITAL_ACTORS_CATALOG) {
    const dossier = getDossierById(actor.id);
    assert.ok(dossier, `Missing dossier for orbital actor ${actor.id}`);
    assert.ok(dossier.biography.trim().length > 20, `Empty biography for ${actor.id}`);
    assert.ok(dossier.technicalSpecs.length >= 1, `Expected technicalSpecs for ${actor.id}`);
    assert.ok(dossier.measuredData.length >= 1, `Expected measuredData for ${actor.id}`);
    assert.ok(dossier.contributions.length >= 1, `Expected contributions for ${actor.id}`);
  }

  assert.ok(Object.keys(DEVICE_DOSSIERS).length >= 26);
});

test('Control Room POV arm deployment and spectrometer scan toggle and reset cleanly', () => {
  const store = useCosmosStore;
  store.getState().selectBody('mars');
  store.getState().selectDevice('perseverance_rover');
  store.getState().setInspectionMode('CONTROL_ROOM_POV');

  assert.equal(store.getState().povArmDeployed, false);
  assert.equal(store.getState().povScanActive, false);

  store.getState().togglePovArm();
  store.getState().togglePovScan();
  assert.equal(store.getState().povArmDeployed, true);
  assert.equal(store.getState().povScanActive, true);

  store.getState().resetPovCamera();
  assert.equal(store.getState().povArmDeployed, false);
  assert.equal(store.getState().povScanActive, false);

  store.getState().togglePovArm();
  store.getState().togglePovScan();
  store.getState().selectDevice('curiosity_rover');
  assert.equal(store.getState().povArmDeployed, false);
  assert.equal(store.getState().povScanActive, false);

  store.getState().togglePovScan();
  store.getState().selectBody('moon');
  assert.equal(store.getState().povScanActive, false);

  store.getState().selectDevice('apollo_17_lrv');
  store.getState().togglePovArm();
  store.getState().returnToOrbit();
  assert.equal(store.getState().povArmDeployed, false);
});
