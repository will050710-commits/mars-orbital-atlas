import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  ORBITAL_ACTORS_CATALOG,
  computeOrbitalPosition,
} from '../../config/celestialCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';
import { AssetCalloutBox } from '../../ui/hud/AssetCalloutBox';

const phobosTarget = ORBITAL_ACTORS_CATALOG.find((c) => c.id === 'phobos')!;

/**
 * Phobos moon orbit and illustrative procedural irregular body.
 * Intentionally avoids fetching `.glb` files during overview so initial globe loads stay at 0 GLB requests.
 */
export const PhobosOrbit: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Group>(null!);
  const worldPosRef = useRef(new THREE.Vector3());

  const selectTarget = useCosmosStore((state) => state.selectTarget);
  const controlsLocked = useCosmosStore((state) => state.controlsLocked);
  const activeTargetId = useCosmosStore((state) => state.activeTarget?.id);
  const viewStage = useCosmosStore((state) => state.viewStage);

  const orbitPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const elems = phobosTarget.orbitalElements!;
    const periodSec = elems.orbitalPeriodHours * 3600;
    const segments = 128;
    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * periodSec;
      pts.push(computeOrbitalPosition(elems, t));
    }
    return pts;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !phobosTarget.orbitalElements) return;
    const simTime = useCosmosStore.getState().simulationTime;
    computeOrbitalPosition(phobosTarget.orbitalElements, simTime, groupRef.current.position);
    groupRef.current.getWorldPosition(worldPosRef.current);
    useCosmosStore.getState().updateDynamicPosition('phobos', worldPosRef.current);

    if (meshRef.current) {
      meshRef.current.rotation.y += Math.min(delta, 0.05) * 0.25;
    }
  });

  const isSelected = activeTargetId === 'phobos';
  const showCallout = !controlsLocked && !(isSelected && viewStage === 'SUB_SCENE');

  return (
    <group>
      <Line
        points={orbitPoints}
        color={isSelected ? '#7cdaa1' : '#5f769a'}
        opacity={isSelected ? 0.72 : 0.28}
        transparent
        lineWidth={1.2}
      />

      <group ref={groupRef} position={phobosTarget.position}>
        <group
          ref={meshRef}
          scale={[phobosTarget.radius, phobosTarget.radius, phobosTarget.radius]}
          onClick={(event) => {
            event.stopPropagation();
            if (!controlsLocked) selectTarget(phobosTarget);
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          {/* Primary triaxial asteroid core */}
          <mesh scale={[1.22, 0.85, 0.96]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 2]} />
            <meshStandardMaterial color="#877366" roughness={0.92} metalness={0.05} />
          </mesh>
          {/* Stickney crater rim silhouette */}
          <mesh position={[0.65, 0.14, 0.35]} rotation={[0.2, 0.9, 0]}>
            <torusGeometry args={[0.38, 0.09, 10, 24]} />
            <meshStandardMaterial color="#6e5c51" roughness={0.95} metalness={0.04} />
          </mesh>
        </group>

        <Html
          zIndexRange={[8, 0]}
          style={{
            opacity: showCallout ? 1 : 0,
            pointerEvents: showCallout ? 'auto' : 'none',
            transition: 'opacity 0.25s ease',
          }}
        >
          <AssetCalloutBox
            title="Phobos"
            meta="MOON I • 9.376 KM"
            category="MOON"
            variant={2}
            isSelected={isSelected}
            isVisible={showCallout}
            onClick={() => selectTarget(phobosTarget)}
          />
        </Html>
      </group>
    </group>
  );
};
