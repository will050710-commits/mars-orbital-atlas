import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  computeOrbitalPosition,
  getOrbitalActorsForBody,
} from '../../config/celestialCatalog';
import { useCosmosStore, type CelestialTarget } from '../../store/useCosmosStore';
import { AssetCalloutBox, type CalloutVariant } from '../../ui/hud/AssetCalloutBox';

interface SpacecraftMetaBadge {
  title: string;
  meta: string;
  variant: CalloutVariant;
  wingSpan: number;
  bodyColor: string;
  accentGlow: string;
  lineColor: string;
}

const SPACECRAFT_META: Record<string, SpacecraftMetaBadge> = {
  mro_orbiter: {
    title: 'MRO Orbiter',
    meta: 'ORBITER • POLAR 92.6°',
    variant: 1,
    wingSpan: 52,
    bodyColor: '#eab64d',
    accentGlow: '#38dcff',
    lineColor: '#f18b62',
  },
  mars_odyssey: {
    title: '2001 Mars Odyssey',
    meta: 'THEMIS • POLAR 93.1°',
    variant: 2,
    wingSpan: 44,
    bodyColor: '#d99e3c',
    accentGlow: '#fb923c',
    lineColor: '#fb923c',
  },
  maven_orbiter: {
    title: 'MAVEN Orbiter',
    meta: 'ATMOSPHERE • ELLIPTICAL',
    variant: 3,
    wingSpan: 48,
    bodyColor: '#cbd5e1',
    accentGlow: '#38bdf8',
    lineColor: '#38bdf8',
  },
  dawn_flyby: {
    title: 'Dawn (2009 Flyby)',
    meta: 'ION FLYBY • ILLUSTRATIVE',
    variant: 4,
    wingSpan: 68,
    bodyColor: '#b8c4d4',
    accentGlow: '#60a5fa',
    lineColor: '#60a5fa',
  },
  ares_station: {
    title: 'Trạm Ares (Minh họa)',
    meta: 'STATION • CONCEPT 5.2K',
    variant: 4,
    wingSpan: 54,
    bodyColor: '#d8e3f2',
    accentGlow: '#68e8ff',
    lineColor: '#7cdaa1',
  },
  lro_orbiter: {
    title: 'LRO Orbiter',
    meta: 'LOLA/LROC • POLAR 89.2°',
    variant: 1,
    wingSpan: 34,
    bodyColor: '#e2e8f0',
    accentGlow: '#38bdf8',
    lineColor: '#7dd3fc',
  },
  apollo_csm: {
    title: 'Apollo CSM (Minh họa)',
    meta: 'HISTORIC ORBIT • ~110 KM',
    variant: 2,
    wingSpan: 22,
    bodyColor: '#cbd5e1',
    accentGlow: '#fbbf24',
    lineColor: '#fbbf24',
  },
};

const SpacecraftNode: React.FC<{ target: CelestialTarget }> = ({ target }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const centrifugeRef = useRef<THREE.Mesh>(null!);
  const worldPosRef = useRef(new THREE.Vector3());

  const selectTarget = useCosmosStore((state) => state.selectTarget);
  const controlsLocked = useCosmosStore((state) => state.controlsLocked);
  const activeTargetId = useCosmosStore((state) => state.activeTarget?.id);
  const viewStage = useCosmosStore((state) => state.viewStage);

  const meta = SPACECRAFT_META[target.id] ?? {
    title: target.name,
    meta: 'ORBITER',
    variant: 1,
    wingSpan: 44,
    bodyColor: '#eab64d',
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

  useFrame((_, delta) => {
    if (!groupRef.current || !target.orbitalElements) return;
    const simTime = useCosmosStore.getState().simulationTime;
    computeOrbitalPosition(target.orbitalElements, simTime, groupRef.current.position);
    groupRef.current.lookAt(0, 0, 0);
    groupRef.current.getWorldPosition(worldPosRef.current);
    useCosmosStore.getState().updateDynamicPosition(target.id, worldPosRef.current);

    if (centrifugeRef.current) {
      centrifugeRef.current.rotation.z += Math.min(delta, 0.05) * 0.9;
    }
  });

  const isSelected = activeTargetId === target.id;
  const isStation = target.id === 'ares_station';
  const isApollo = target.id === 'apollo_csm';
  const showCallout = !controlsLocked && !(isSelected && viewStage === 'SUB_SCENE');
  const wingOffset = meta.wingSpan * 0.72;
  const scaleFactor = target.bodyId === 'moon' ? 1.25 : 1.75;

  return (
    <group>
      <Line
        points={orbitPoints}
        color={isSelected ? '#7cdaa1' : meta.lineColor}
        opacity={isSelected ? 0.78 : 0.28}
        transparent
        lineWidth={1.15}
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
        <group scale={[scaleFactor, scaleFactor, scaleFactor]}>
          {/* Core spacecraft bus */}
          <mesh>
            <cylinderGeometry args={isApollo ? [9, 9, 28, 16] : [10, 12, 30, 16]} />
            <meshStandardMaterial color={meta.bodyColor} metalness={0.82} roughness={0.28} />
          </mesh>

          {isStation ? (
            <mesh ref={centrifugeRef} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[28, 3.2, 14, 42]} />
              <meshStandardMaterial color="#b9cbe2" metalness={0.78} roughness={0.32} />
            </mesh>
          ) : isApollo ? (
            <>
              <mesh position={[0, 19, 0]}>
                <coneGeometry args={[9.5, 11, 16]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0, -18, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[7, 10, 16]} />
                <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.35} />
              </mesh>
            </>
          ) : (
            <mesh position={[0, 19, 0]}>
              <sphereGeometry args={[13, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
              <meshStandardMaterial
                color="#f4f6fa"
                metalness={0.6}
                roughness={0.35}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Twin solar arrays */}
          {!isApollo && (
            <>
              <mesh position={[wingOffset, 0, 0]}>
                <boxGeometry args={[meta.wingSpan, 1.2, 13]} />
                <meshStandardMaterial color="#1d428a" metalness={0.88} roughness={0.22} />
              </mesh>
              <mesh position={[-wingOffset, 0, 0]}>
                <boxGeometry args={[meta.wingSpan, 1.2, 13]} />
                <meshStandardMaterial color="#1d428a" metalness={0.88} roughness={0.22} />
              </mesh>
            </>
          )}

          {/* Ion thruster / telemetry beacon */}
          <mesh position={[0, -20, 0]}>
            <sphereGeometry args={[5, 14, 14]} />
            <meshStandardMaterial
              color={meta.accentGlow}
              emissive={meta.accentGlow}
              emissiveIntensity={2.8}
              toneMapped={false}
            />
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
            title={meta.title}
            meta={meta.meta}
            category="SPACECRAFT"
            variant={meta.variant}
            isSelected={isSelected}
            isVisible={showCallout}
            onClick={() => selectTarget(target)}
          />
        </Html>
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
