import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ORBITAL_ACTORS_CATALOG,
  computeOrbitalPosition,
} from '../../config/celestialCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';
import { NativeOrbitLine } from '../common/NativeOrbitLine';
import { OrbitalGlbModel } from '../common/OrbitalGlbModel';

const phobosTarget = ORBITAL_ACTORS_CATALOG.find((c) => c.id === 'phobos')!;

/**
 * Phobos moon orbit rendering the official NASA 3D Resources GLB model
 * along its documented Keplerian trajectory around Mars.
 */
export const PhobosOrbit: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const worldPosRef = useRef(new THREE.Vector3());

  const selectTarget = useCosmosStore((state) => state.selectTarget);
  const controlsLocked = useCosmosStore((state) => state.controlsLocked);
  const activeTargetId = useCosmosStore((state) => state.activeTarget?.id);

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

  useFrame(() => {
    if (!groupRef.current || !phobosTarget.orbitalElements) return;
    const simTime = useCosmosStore.getState().simulationTime;
    computeOrbitalPosition(phobosTarget.orbitalElements, simTime, groupRef.current.position);
    groupRef.current.getWorldPosition(worldPosRef.current);
    useCosmosStore.getState().updateDynamicPosition('phobos', worldPosRef.current);
  });

  const isSelected = activeTargetId === 'phobos';

  return (
    <group>
      <NativeOrbitLine
        points={orbitPoints}
        color={isSelected ? '#7cdaa1' : '#5f769a'}
        opacity={isSelected ? 0.72 : 0.28}
        transparent
      />

      <group
        ref={groupRef}
        position={phobosTarget.position}
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
        {phobosTarget.modelPath ? (
          <OrbitalGlbModel
            modelPath={phobosTarget.modelPath}
            visualRadius={phobosTarget.radius}
            isSelected={isSelected}
            accentColor="#7cdaa1"
            spinAxisYRate={0.18}
            showSelectionRing
          />
        ) : null}
      </group>
    </group>
  );
};
