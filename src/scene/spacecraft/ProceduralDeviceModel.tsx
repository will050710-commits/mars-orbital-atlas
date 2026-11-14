import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import type * as THREE from 'three';
import { useCosmosStore } from '../../store/useCosmosStore';
import type { DevicePartGroupId, ProceduralModelKind } from '../../types/cosmos.types';

export type ExtendedProceduralKind =
  | ProceduralModelKind
  | 'orbiter_science'
  | 'station_centrifuge'
  | 'apollo_csm_craft';

interface ProceduralDeviceModelProps {
  kind: ExtendedProceduralKind;
  name?: string;
}

const SUBSYSTEM_COLORS = {
  highlightEmissive: '#38bdf8',
  metal: '#cbd5e1',
  darkMetal: '#334155',
  kaptonGold: '#d4a12a',
  deckWhite: '#e2e8f0',
  solarBlue: '#1d4ed8',
  accentOrange: '#ea580c',
};

function groupOpacity(
  activeGroup: DevicePartGroupId,
  group: DevicePartGroupId,
): { opacity: number; transparent: boolean; emissive: string; emissiveIntensity: number } {
  if (activeGroup === 'all') {
    return { opacity: 1, transparent: false, emissive: '#000000', emissiveIntensity: 0 };
  }
  if (activeGroup === group) {
    return {
      opacity: 1,
      transparent: false,
      emissive: SUBSYSTEM_COLORS.highlightEmissive,
      emissiveIntensity: 0.32,
    };
  }
  return { opacity: 0.2, transparent: true, emissive: '#000000', emissiveIntensity: 0 };
}

function MarsRoverAssembly({
  activeGroup,
  mastRef,
  wheelGroupRef,
}: {
  activeGroup: DevicePartGroupId;
  mastRef: React.RefObject<THREE.Group | null>;
  wheelGroupRef: React.RefObject<THREE.Group | null>;
}) {
  const mastMat = groupOpacity(activeGroup, 'optics_mast');
  const chassisMat = groupOpacity(activeGroup, 'mobility_chassis');
  const powerMat = groupOpacity(activeGroup, 'power_thermal');
  const armMat = groupOpacity(activeGroup, 'payload_science');

  const wheelPositions: Array<[number, number, number]> = [
    [-0.58, -0.32, 0.56],
    [0.58, -0.32, 0.56],
    [-0.6, -0.32, 0.0],
    [0.6, -0.32, 0.0],
    [-0.58, -0.32, -0.56],
    [0.58, -0.32, -0.56],
  ];

  return (
    <group>
      {/* Main warm electronics box (WEB) chassis */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.72, 0.34, 1.05]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.deckWhite} roughness={0.45} metalness={0.35} {...chassisMat} />
      </mesh>
      <mesh position={[0, 0.22, -0.04]}>
        <boxGeometry args={[0.76, 0.05, 1.08]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} roughness={0.35} metalness={0.7} {...chassisMat} />
      </mesh>

      {/* 6 Rocker-Bogie wheels + Titanium struts */}
      <group ref={wheelGroupRef}>
        {wheelPositions.map(([x, y, z], idx) => (
          <group key={idx} position={[x, y, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.17, 0.17, 0.16, 20]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.darkMetal} roughness={0.7} metalness={0.65} {...chassisMat} />
            </mesh>
            <mesh position={[x > 0 ? -0.14 : 0.14, 0.19, 0]} rotation={[0, 0, x > 0 ? 0.55 : -0.55]}>
              <boxGeometry args={[0.045, 0.38, 0.05]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} roughness={0.35} metalness={0.85} {...chassisMat} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Aft MMRTG Radioisotope Power System with cooling fins */}
      <group position={[0, 0.18, -0.68]} rotation={[-0.45, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.15, 0.48, 12]} />
          <meshStandardMaterial color="#b4c0ce" roughness={0.4} metalness={0.8} {...powerMat} />
        </mesh>
        {[0, 1, 2, 3].map((idx) => (
          <mesh key={idx} rotation={[0, (idx * Math.PI) / 4, 0]}>
            <boxGeometry args={[0.38, 0.42, 0.02]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} metalness={0.5} {...powerMat} />
          </mesh>
        ))}
      </group>

      {/* High-Gain X-Band Dish Antenna */}
      <mesh position={[-0.22, 0.36, -0.32]} rotation={[0.45, 0, 0.2]}>
        <cylinderGeometry args={[0.19, 0.04, 0.08, 24]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} roughness={0.3} metalness={0.75} {...powerMat} />
      </mesh>

      {/* Remote Sensing Mast + SuperCam / Mastcam-Z Optics Head */}
      <group ref={mastRef} position={[0.18, 0.24, 0.36]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.038, 0.045, 0.62, 14]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} roughness={0.35} metalness={0.8} {...mastMat} />
        </mesh>
        <group position={[0, 0.62, 0]}>
          <mesh>
            <boxGeometry args={[0.24, 0.14, 0.18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.3} {...mastMat} />
          </mesh>
          {/* ChemCam cyclops aperture & stereo Navcam optics */}
          <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.036, 0.036, 0.04, 16]} />
            <meshStandardMaterial
              color="#0ea5e9"
              opacity={mastMat.opacity}
              transparent={mastMat.transparent}
              emissive={mastMat.emissiveIntensity > 0 ? mastMat.emissive : '#0284c7'}
              emissiveIntensity={mastMat.emissiveIntensity > 0 ? mastMat.emissiveIntensity : 0.45}
            />
          </mesh>
          <mesh position={[-0.07, -0.02, 0.095]}>
            <boxGeometry args={[0.035, 0.025, 0.02]} />
            <meshStandardMaterial color="#1e293b" {...mastMat} />
          </mesh>
          <mesh position={[0.07, -0.02, 0.095]}>
            <boxGeometry args={[0.035, 0.025, 0.02]} />
            <meshStandardMaterial color="#1e293b" {...mastMat} />
          </mesh>
        </group>
      </group>

      {/* Forward 5-DOF Robotic Arm + Coring Turret */}
      <group position={[-0.08, 0.02, 0.56]}>
        <mesh position={[0, 0, 0.16]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.42]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.75} roughness={0.35} {...armMat} />
        </mesh>
        <mesh position={[0.02, -0.08, 0.36]}>
          <cylinderGeometry args={[0.14, 0.14, 0.14, 16]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.accentOrange} metalness={0.6} roughness={0.4} {...armMat} />
        </mesh>
      </group>
    </group>
  );
}

function ApolloLrvAssembly({
  kind,
  activeGroup,
  mastRef,
}: {
  kind: 'apollo_lrv' | 'apollo_lrv_deploy';
  activeGroup: DevicePartGroupId;
  mastRef: React.RefObject<THREE.Group | null>;
}) {
  const isDeploy = kind === 'apollo_lrv_deploy';
  const mastMat = groupOpacity(activeGroup, 'optics_mast');
  const chassisMat = groupOpacity(activeGroup, 'mobility_chassis');
  const powerMat = groupOpacity(activeGroup, 'power_thermal');
  const payloadMat = groupOpacity(activeGroup, 'payload_science');

  const wheelCoords: Array<[number, number, number]> = [
    [-0.56, -0.26, 0.58],
    [0.56, -0.26, 0.58],
    [-0.56, -0.26, -0.58],
    [0.56, -0.26, -0.58],
  ];

  return (
    <group rotation={[isDeploy ? 0.32 : 0, 0, isDeploy ? -0.18 : 0]}>
      {/* Tubular spaceframe deck */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.92, 0.09, 1.38]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.3} {...chassisMat} />
      </mesh>
      {/* Aft deployment hinge truss when in deployment pose */}
      {isDeploy && (
        <mesh position={[0, 0.25, -0.78]} rotation={[0.55, 0, 0]}>
          <boxGeometry args={[0.85, 0.42, 0.12]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.7} roughness={0.4} {...chassisMat} />
        </mesh>
      )}
      {/* 4 Woven-wire mesh wheels + dust fenders */}
      {wheelCoords.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.14, 18]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.75} metalness={0.55} {...chassisMat} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.18, 0.03, 0.34]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.accentOrange} roughness={0.5} {...chassisMat} />
          </mesh>
        </group>
      ))}
      {/* Twin Astronaut Seats + Center T-Handle Controller */}
      {[-0.24, 0.24].map((x) => (
        <group key={x} position={[x, 0.14, -0.05]}>
          <mesh>
            <boxGeometry args={[0.28, 0.04, 0.3]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.8} {...chassisMat} />
          </mesh>
          <mesh position={[0, 0.2, -0.13]}>
            <boxGeometry args={[0.26, 0.36, 0.04]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.8} {...chassisMat} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.22, 0.18]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.34, 10]} />
        <meshStandardMaterial color="#38bdf8" {...payloadMat} />
      </mesh>
      {/* Forward High-Gain Umbrella Dish + LCRU TV Camera Mast */}
      <group ref={mastRef} position={[0, 0.16, 0.56]}>
        <mesh position={[-0.22, 0.28, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.45, 10]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.8} {...mastMat} />
        </mesh>
        <mesh position={[-0.22, 0.52, 0.06]} rotation={[0.9, 0, 0]}>
          <coneGeometry args={[0.3, 0.14, 18, 1, true]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} roughness={0.45} metalness={0.75} side={2} {...mastMat} />
        </mesh>
        <mesh position={[0.22, 0.24, 0.04]}>
          <boxGeometry args={[0.14, 0.12, 0.18]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.deckWhite} roughness={0.35} {...mastMat} />
        </mesh>
      </group>
      {/* Forward Batteries & Thermal Louvers */}
      <mesh position={[0, 0.06, 0.58]}>
        <boxGeometry args={[0.64, 0.18, 0.22]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.8} roughness={0.3} {...powerMat} />
      </mesh>
      {/* Aft Science Palette (GCR / SEP / Tool Carrier) */}
      <mesh position={[0, 0.14, -0.52]}>
        <boxGeometry args={[0.72, 0.22, 0.3]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.45} {...payloadMat} />
      </mesh>
    </group>
  );
}

function ApolloSurfacePackOrMesa({
  kind,
  activeGroup,
}: {
  kind: 'apollo_surface_pack' | 'apollo_lm_mesa';
  activeGroup: DevicePartGroupId;
}) {
  const opticsMat = groupOpacity(activeGroup, 'optics_mast');
  const powerMat = groupOpacity(activeGroup, 'power_thermal');
  const payloadMat = groupOpacity(activeGroup, 'payload_science');
  const chassisMat = groupOpacity(activeGroup, 'mobility_chassis');

  if (kind === 'apollo_surface_pack') {
    return (
      <group>
        {/* Central ALSEP / LRRR Optical Cube Package */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.72, 0.36, 0.56]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.deckWhite} roughness={0.4} metalness={0.3} {...payloadMat} />
        </mesh>
        <mesh position={[0, 0.21, 0.06]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[0.48, 0.06, 0.42]} />
          <meshStandardMaterial color="#0284c7" metalness={0.85} roughness={0.18} {...opticsMat} />
        </mesh>
        {/* SNAP-27 RTG Finned Power Cask */}
        <group position={[-0.64, -0.05, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 0.48, 14]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.darkMetal} metalness={0.8} roughness={0.35} {...powerMat} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.42, 0.4, 0.03]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.7} {...powerMat} />
          </mesh>
        </group>
        {/* Passive Seismic Antenna Mast */}
        <mesh position={[0.46, 0.34, -0.18]}>
          <cylinderGeometry args={[0.025, 0.03, 0.85, 10]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.85} {...opticsMat} />
        </mesh>
      </group>
    );
  }

  // apollo_lm_mesa: LM Descent Stage Quadrant Bay + Fold-down MESA tray
  return (
    <group>
      {/* Kapton-wrapped LM Descent Stage Quadrant Bulkhead */}
      <mesh position={[0, 0.12, -0.22]}>
        <boxGeometry args={[1.15, 0.96, 0.62]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.82} roughness={0.32} {...chassisMat} />
      </mesh>
      {/* Hinged Modularized Equipment Stowage Assembly (MESA) Workbench */}
      <mesh position={[0, -0.1, 0.38]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[0.92, 0.08, 0.68]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.deckWhite} metalness={0.45} roughness={0.4} {...payloadMat} />
      </mesh>
      {/* MESA Westinghouse TV Camera Bracket facing outward toward Ladder */}
      <mesh position={[-0.36, 0.04, 0.56]} rotation={[0.15, 0.25, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.24]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.8} roughness={0.3} {...opticsMat} />
      </mesh>
      {/* Descent Footpad Strut */}
      <mesh position={[0.52, -0.42, 0.12]}>
        <cylinderGeometry args={[0.24, 0.3, 0.08, 20]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.78} roughness={0.35} {...powerMat} />
      </mesh>
    </group>
  );
}

function OrbitalCraftAssembly({
  kind,
  spinRef,
}: {
  kind: 'orbiter_science' | 'station_centrifuge' | 'apollo_csm_craft';
  spinRef: React.RefObject<THREE.Group | null>;
}) {
  if (kind === 'station_centrifuge') {
    return (
      <group>
        <mesh>
          <cylinderGeometry args={[0.18, 0.2, 1.45, 20]} />
          <meshStandardMaterial color="#dbeafe" metalness={0.78} roughness={0.28} />
        </mesh>
        <group ref={spinRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.65, 0.085, 16, 48]} />
            <meshStandardMaterial color="#b9cbe2" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
        <mesh position={[0.85, 0, -0.25]}>
          <boxGeometry args={[0.95, 0.02, 0.28]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.solarBlue} metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[-0.85, 0, -0.25]}>
          <boxGeometry args={[0.95, 0.02, 0.28]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.solarBlue} metalness={0.88} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (kind === 'apollo_csm_craft') {
    return (
      <group rotation={[0.15, 0.35, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.72, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <coneGeometry args={[0.32, 0.38, 24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.68} roughness={0.32} />
        </mesh>
        <mesh position={[0, -0.68, 0]}>
          <cylinderGeometry args={[0.08, 0.24, 0.36, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.35} />
        </mesh>
      </group>
    );
  }

  // orbiter_science: MAVEN / Odyssey / LRO class polar orbiter
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.42, 0.56, 0.42]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.42, 0.08]} rotation={[0.35, 0, 0]}>
        <coneGeometry args={[0.34, 0.14, 24, 1, true]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.55} roughness={0.35} side={2} />
      </mesh>
      <mesh position={[0.72, 0, 0]}>
        <boxGeometry args={[0.88, 0.03, 0.32]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.solarBlue} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.72, 0, 0]}>
        <boxGeometry args={[0.88, 0.03, 0.32]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.solarBlue} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

/**
 * Normalized procedural 3D hardware reconstructions (2-unit scale) for documented
 * rovers, Apollo equipment, and illustrative orbiters that do not ship a NASA GLB file.
 */
export function ProceduralDeviceModel({ kind }: ProceduralDeviceModelProps) {
  const activePartGroupId = useCosmosStore((state) => state.activePartGroupId);
  const rotorStepDeg = useCosmosStore((state) => state.rotorStepDeg);
  const mastRef = useRef<THREE.Group | null>(null);
  const wheelRef = useRef<THREE.Group | null>(null);

  useFrame((_, delta) => {
    const mode = useCosmosStore.getState().rotorSpinMode;
    if (mastRef.current) {
      if (mode === 'demo_slow') {
        mastRef.current.rotation.y += Math.min(delta, 0.05) * 0.7;
      } else {
        mastRef.current.rotation.y = MathUtils.degToRad(rotorStepDeg);
      }
    }
    if (wheelRef.current && mode === 'demo_slow') {
      wheelRef.current.rotation.z += Math.min(delta, 0.05) * 0.6;
    }
  });

  return (
    <group>
      {kind === 'mars_rover_rtg' && (
        <MarsRoverAssembly
          activeGroup={activePartGroupId}
          mastRef={mastRef}
          wheelGroupRef={wheelRef}
        />
      )}
      {(kind === 'apollo_lrv' || kind === 'apollo_lrv_deploy') && (
        <ApolloLrvAssembly kind={kind} activeGroup={activePartGroupId} mastRef={mastRef} />
      )}
      {(kind === 'apollo_surface_pack' || kind === 'apollo_lm_mesa') && (
        <ApolloSurfacePackOrMesa kind={kind} activeGroup={activePartGroupId} />
      )}
      {(kind === 'orbiter_science' ||
        kind === 'station_centrifuge' ||
        kind === 'apollo_csm_craft') && (
        <OrbitalCraftAssembly kind={kind} spinRef={wheelRef} />
      )}
    </group>
  );
}
