import type {
  BodyConfig,
  CelestialTarget,
  DeviceControlSpec,
  DeviceRecord,
} from '../types/cosmos.types';

export function validateCatalog(bodies: BodyConfig[], pois: CelestialTarget[], devices: DeviceRecord[]): void {
  const ids = new Set<string>();
  for (const record of [...bodies, ...pois, ...devices]) {
    if (!/^[a-z][a-z0-9_]*$/.test(record.id) || ids.has(record.id)) throw new Error('Invalid or duplicate ID: ' + record.id);
    ids.add(record.id);
  }
  const bodyIds = new Set(bodies.map((body) => body.id));
  for (const body of bodies) {
    if (!Number.isFinite(body.radiusKm) || body.radiusKm <= 0 || !Number.isFinite(body.rotationSeconds) || body.rotationSeconds <= 0) throw new Error('Invalid body units: ' + body.id);
    if (!body.source.url || !body.source.checked || !body.source.version) throw new Error('Missing body provenance');
    if (!body.target || body.target.id !== body.id || body.target.bodyId !== body.id) throw new Error('Body target does not match its body: ' + body.id);
    if (new Set(body.layers.map((layer) => layer.id)).size !== body.layers.length) throw new Error('Duplicate layers');
  }
  for (const poi of pois) {
    const c = poi.coordinates;
    if (!poi.bodyId || !bodyIds.has(poi.bodyId) || !c || !Number.isFinite(c.lat) || !Number.isFinite(c.lon) || Math.abs(c.lat) > 90 || c.lon < 0 || c.lon >= 360) throw new Error('Invalid POI: ' + poi.id);
    if (!poi.source?.url || !poi.source.checked) throw new Error('Missing POI provenance');
    if (poi.isSurfaceLanding) throw new Error('No verified terrain provider configured');
  }
  for (const device of devices) {
    if (!bodyIds.has(device.bodyId) || !device.source.url || !device.source.checked || !device.credit || !device.version || !device.evidence || !device.units) throw new Error('Missing device metadata: ' + device.id);
    if (device.transform.normalization !== 'fit-longest-side-2' || device.transform.physicalScaleVerified !== false || device.transform.rotation.length !== 3 || !device.transform.rotation.every(Number.isFinite)) throw new Error('Invalid transform');
    if (device.status === 'available') {
      if (!device.modelPath?.startsWith('/assets/models/') || device.modelPath.includes('..') || !device.modelPath.endsWith('.glb') || !device.bytes || !/^[a-f0-9]{64}$/.test(device.sha256 ?? '') || !device.license.url || !device.license.checked) throw new Error('Incomplete model manifest: ' + device.id);
    } else if (device.status !== 'unavailable' || device.modelPath || device.bytes || device.sha256) throw new Error('Invalid unavailable device: ' + device.id);
  }
}

export function validateDeviceControlSpecs(
  devices: DeviceRecord[],
  specs: Record<string, DeviceControlSpec>,
): void {
  const devicesById = new Map(devices.map((device) => [device.id, device]));
  for (const [key, spec] of Object.entries(specs)) {
    if (key !== spec.deviceId) {
      throw new Error('Mismatched device control key: ' + key);
    }
    const device = devicesById.get(spec.deviceId);
    if (!device || device.status !== 'available' || !device.modelPath) {
      throw new Error('Control spec targets unavailable or unknown device: ' + spec.deviceId);
    }
    if (!spec.modelVersion || !spec.generalDisclaimer || spec.sources.length === 0) {
      throw new Error('Incomplete control spec provenance: ' + spec.deviceId);
    }
    for (const source of spec.sources) {
      if (!source.title || !source.url || !source.checked || !source.version) {
        throw new Error('Invalid control spec source: ' + spec.deviceId);
      }
    }
    if (spec.cameraViews.length < 2) {
      throw new Error('Control spec requires at least 2 camera views: ' + spec.deviceId);
    }
    const viewIds = new Set<string>();
    for (const view of spec.cameraViews) {
      if (!view.id || viewIds.has(view.id)) {
        throw new Error('Duplicate or empty camera view ID: ' + view.id);
      }
      viewIds.add(view.id);
      if (
        view.position.length !== 3 ||
        view.target.length !== 3 ||
        !view.position.every(Number.isFinite) ||
        !view.target.every(Number.isFinite)
      ) {
        throw new Error('Invalid camera view vector: ' + view.id);
      }
      const dx = view.position[0] - view.target[0];
      const dy = view.position[1] - view.target[1];
      const dz = view.position[2] - view.target[2];
      if (Math.hypot(dx, dy, dz) < 0.05) {
        throw new Error('Degenerate camera view distance: ' + view.id);
      }
      if (!view.label || !view.summary || !view.sourceRef || !view.isIllustrativeView) {
        throw new Error('Missing camera view metadata: ' + view.id);
      }
    }
    const groupIds = new Set<string>();
    const mappedNodes = new Set<string>();
    for (const group of spec.partGroups) {
      if (!group.id || groupIds.has(group.id) || group.nodeNames.length === 0) {
        throw new Error('Invalid device part group: ' + group.id);
      }
      groupIds.add(group.id);
      group.nodeNames.forEach((name) => mappedNodes.add(name));
      if (!group.label || !group.documentedSpec || !group.sourceRef || !group.limitationNote) {
        throw new Error('Missing part group documentation: ' + group.id);
      }
    }
    if (spec.rotorControl) {
      const rotor = spec.rotorControl;
      if (
        !rotor.upperNodeName ||
        !rotor.lowerNodeName ||
        !mappedNodes.has(rotor.upperNodeName) ||
        !mappedNodes.has(rotor.lowerNodeName)
      ) {
        throw new Error('Rotor control nodes missing from partGroups: ' + spec.deviceId);
      }
      if (
        rotor.localAxis.length !== 3 ||
        !rotor.localAxis.every(Number.isFinite) ||
        Math.hypot(...rotor.localAxis) === 0
      ) {
        throw new Error('Invalid rotor local axis: ' + spec.deviceId);
      }
      if (
        !Number.isFinite(rotor.demoSpinRadPerSec) ||
        rotor.demoSpinRadPerSec <= 0 ||
        rotor.stepAnglesDeg.length === 0 ||
        rotor.stepAnglesDeg.some((deg) => !Number.isFinite(deg) || deg < 0 || deg >= 360)
      ) {
        throw new Error('Invalid rotor timing or step angles: ' + spec.deviceId);
      }
    }
  }
}
