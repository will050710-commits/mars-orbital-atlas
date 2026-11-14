import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  MARS_AXIAL_TILT_RAD,
  MOON_AXIAL_TILT_RAD,
} from '../../config/celestialCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';
import type { BodyConfig } from '../../types/cosmos.types';
import { SUN_DIRECTION_VECTOR } from '../environment/SunLightSource';

/**
 * Renders illustrative orbital reference geometry in the planetary neighborhood:
 * - Heliocentric (Mars) or geocentric (Moon) trajectory arc passing through origin (0,0,0)
 * - Equatorial plane ring & spin-axis obliquity pole indicator (25.19° Mars / 6.68° Moon)
 * - Solar illumination direction vector pointing toward the directional Sun source
 */
export function PlanetaryOrbitContext({ body }: { body: BodyConfig }) {
  const showOrbits = useCosmosStore((state) => state.showOrbits);
  const viewStage = useCosmosStore((state) => state.viewStage);

  const tiltRad = body.id === 'mars' ? MARS_AXIAL_TILT_RAD : MOON_AXIAL_TILT_RAD;

  const { trajectoryArcPoints, sunVectorPoints, equatorialRingPoints, poleAxisPoints } =
    useMemo(() => {
      const rOrbit = body.id === 'mars' ? 54000 : 28000;
      const arc: THREE.Vector3[] = [];
      const segments = 96;
      const spanRad = 0.72;
      for (let i = 0; i <= segments; i += 1) {
        const theta = -spanRad + (i / segments) * spanRad * 2;
        arc.push(
          new THREE.Vector3(
            Math.sin(theta) * rOrbit,
            0,
            (Math.cos(theta) - 1) * rOrbit,
          ),
        );
      }

      const sunDir = new THREE.Vector3(...SUN_DIRECTION_VECTOR).normalize();
      const sunStart = sunDir.clone().multiplyScalar(body.radiusKm * 1.35);
      const sunEnd = sunDir.clone().multiplyScalar(body.radiusKm * 4.4);

      const ringRadius = body.radiusKm * 1.48;
      const eqRing: THREE.Vector3[] = [];
      for (let i = 0; i <= 96; i += 1) {
        const a = (i / 96) * Math.PI * 2;
        eqRing.push(new THREE.Vector3(Math.cos(a) * ringRadius, 0, Math.sin(a) * ringRadius));
      }

      const poleExtent = body.radiusKm * 1.42;
      const axis: THREE.Vector3[] = [
        new THREE.Vector3(0, -poleExtent, 0),
        new THREE.Vector3(0, poleExtent, 0),
      ];

      return {
        trajectoryArcPoints: arc,
        sunVectorPoints: [sunStart, sunEnd],
        equatorialRingPoints: eqRing,
        poleAxisPoints: axis,
      };
    }, [body.id, body.radiusKm]);

  if (!showOrbits || viewStage === 'PRELOADING' || viewStage === 'LAUNCHING') {
    return null;
  }

  return (
    <group>
      {/* Heliocentric (Mars) or geocentric (Moon) orbital path arc */}
      <Line
        points={trajectoryArcPoints}
        color={body.id === 'mars' ? '#f59e0b' : '#94a3b8'}
        opacity={0.34}
        transparent
        dashed
        dashSize={650}
        gapSize={420}
        lineWidth={1.3}
      />

      {/* Solar direction reference ray */}
      <Line
        points={sunVectorPoints}
        color="#fde047"
        opacity={0.45}
        transparent
        dashed
        dashSize={450}
        gapSize={300}
        lineWidth={1.2}
      />

      {/* Obliquity polar axis & equatorial plane reference ring */}
      <group rotation={[0, 0, tiltRad]}>
        <Line
          points={equatorialRingPoints}
          color="#38bdf8"
          opacity={0.22}
          transparent
          lineWidth={1}
        />
        <Line
          points={poleAxisPoints}
          color="#e2e8f0"
          opacity={0.4}
          transparent
          dashed
          dashSize={240}
          gapSize={180}
          lineWidth={1.2}
        />
      </group>
    </group>
  );
}
