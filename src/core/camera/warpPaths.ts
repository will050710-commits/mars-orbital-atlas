import * as THREE from 'three';
import type { CelestialTarget } from '../../types/cosmos.types';
export interface WarpTrajectoryResult { curve: THREE.CatmullRomCurve3; endPosition: THREE.Vector3 }

// Sample a radial arc instead of a straight chord through the globe.
export function buildSafeWarpSpline(startPos: THREE.Vector3, target: CelestialTarget, bodyRadius = 3389.5): WarpTrajectoryResult {
  const startDirection = startPos.clone().normalize();
  if (startDirection.lengthSq() === 0) startDirection.set(0, 0.3, 1).normalize();
  const direction = target.category === 'SURFACE_POI' ? target.position.clone().normalize() : startDirection.clone();
  const endPosition = target.position.clone().addScaledVector(direction, target.safeViewDistance);
  const endDirection = endPosition.clone().normalize();
  const rotation = new THREE.Quaternion().setFromUnitVectors(startDirection, endDirection);
  const minRadius = bodyRadius * 1.08;
  const points = Array.from({ length: 33 }, (_, i) => {
    const t = i / 32;
    const q = new THREE.Quaternion().slerp(rotation, t);
    return startDirection.clone().applyQuaternion(q).multiplyScalar(Math.max(minRadius, THREE.MathUtils.lerp(startPos.length(), endPosition.length(), t)));
  });
  return { curve: new THREE.CatmullRomCurve3(points, false, 'centripetal'), endPosition };
}
