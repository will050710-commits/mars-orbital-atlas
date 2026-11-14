import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  computeOrbitalPosition,
  getOrbitalActorsForBody,
} from '../../config/celestialCatalog';
import { useCosmosStore, type CelestialTarget } from '../../store/useCosmosStore';
import { NativeOrbitLine } from '../common/NativeOrbitLine';
import { OrbitalGlbModel } from '../common/OrbitalGlbModel';

interface SpacecraftMetaBadge {
  accentGlow: string;
  lineColor: string;
}

const SPACECRAFT_META: Record<string, SpacecraftMetaBadge> = {
  mro_orbiter: {
    accentGlow: '#38dcff',
    lineColor: '#f18b62',
  },
  mars_odyssey: {
    accentGlow: '#fb923c',
    lineColor: '#fb923c',
  },
  maven_orbiter: {
    accentGlow: '#38bdf8',
    lineColor: '#38bdf8',
  },
  dawn_flyby: {
    accentGlow: '#60a5fa',
    lineColor: '#60a5fa',
  },
  ares_station: {
    accentGlow: '#68e8ff',
    lineColor: '#7cdaa1',
  },
  lro_orbiter: {
    accentGlow: '#38bdf8',
    lineColor: '#7dd3fc',
  },
  apollo_csm: {
    accentGlow: '#fbbf24',
    lineColor: '#fbbf24',
  },
};

const SpacecraftNode: React.FC<{ target: CelestialTarget }> = ({ target }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const worldPosRef = useRef(new THREE.Vector3());

  const selectTarget = useCosmosStore((state) => state.selectTarget);
  const controlsLocked = useCosmosStore((state) => state.controlsLocked);
  const activeTargetId = useCosmosStore((state) => state.activeTarget?.id);

  const meta = SPACECRAFT_META[target.id] ?? {
    accentGlow: '#38dcff',
    lineColor: '#f18b62',
  };

  const orbitPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const elems = target.orbitalElements!;
    const periodSec = elems.orbitalPeriodHours * 3600;
    const segments = 128;
    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * periodSec;
      pts.push(computeOrbitalPosition(elems, t));
    }
    return pts;
  }, [target]);

  useFrame(() => {
    if (!groupRef.current || !target.orbitalElements) return;
    const simTime = useCosmosStore.getState().simulationTime;
    computeOrbitalPosition(target.orbitalElements, simTime, groupRef.current.position);
    groupRef.current.lookAt(0, 0, 0);
    groupRef.current.getWorldPosition(worldPosRef.current);
    useCosmosStore.getState().updateDynamicPosition(target.id, worldPosRef.current);
  });

  const isSelected = activeTargetId === target.id;
  const visualRadius = target.radius;

  return (
    <group>
      <NativeOrbitLine
        points={orbitPoints}
        color={isSelected ? '#7cdaa1' : meta.lineColor}
        opacity={isSelected ? 0.78 : 0.28}
        transparent
      />

      <group
        ref={groupRef}
        position={target.position}
        onClick={(event) => {
          event.stopPropagation();
          if (!controlsLocked) selectTarget(target);
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {target.modelPath ? (
          <OrbitalGlbModel
            modelPath={target.modelPath}
            visualRadius={visualRadius}
            isSelected={isSelected}
            accentColor={meta.accentGlow}
            showSelectionRing
          />
        ) : null}
      </group>
    </group>
  );
};

export const OrbitalFleet: React.FC = () => {
  const activeBodyId = useCosmosStore((state) => state.activeBodyId);
  const showOrbits = useCosmosStore((state) => state.showOrbits);
  const spacecraftList = useMemo(
    () =>
      getOrbitalActorsForBody(activeBodyId).filter(
        (item) => item.category === 'SPACECRAFT' && Boolean(item.orbitalElements),
      ),
    [activeBodyId],
  );

  if (!showOrbits) return null;

  return (
    <group>
      {spacecraftList.map((sc) => (
        <SpacecraftNode key={sc.id} target={sc} />
      ))}
    </group>
  );
};
