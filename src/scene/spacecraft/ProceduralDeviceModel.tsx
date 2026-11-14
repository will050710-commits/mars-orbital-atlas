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
  deviceId?: string;
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
  deviceId,
  activeGroup,
  mastRef,
  armRef,
  wheelGroupRef,
}: {
  deviceId?: string;
  activeGroup: DevicePartGroupId;
  mastRef: React.RefObject<THREE.Group | null>;
  armRef: React.RefObject<THREE.Group | null>;
  wheelGroupRef: React.RefObject<THREE.Group | null>;
}) {
  const isPerseverance = deviceId === 'perseverance_rover';
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
      {/* Sculpted Martian regolith & basalt display pedestal */}
      <group position={[0, -0.52, 0]}>
        <mesh>
          <cylinderGeometry args={[1.38, 1.44, 0.045, 40]} />
          <meshStandardMaterial color="#8c4227" roughness={0.92} metalness={0.05} />
        </mesh>
        <mesh position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.41, 0.016, 10, 48]} />
          <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.82} />
        </mesh>
        {[-0.58, 0.58].map((x) => (
          <mesh key={x} position={[x, 0.024, 0]}>
            <boxGeometry args={[0.17, 0.006, 2.04]} />
            <meshStandardMaterial color="#5e2a18" roughness={0.96} />
          </mesh>
        ))}
      </group>
      {/* Main warm electronics box (WEB) chassis & rover deck */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.72, 0.34, isPerseverance ? 1.12 : 1.05]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.deckWhite} roughness={0.45} metalness={0.35} {...chassisMat} />
      </mesh>
      <mesh position={[0, 0.22, -0.04]}>
        <boxGeometry args={[0.76, 0.05, isPerseverance ? 1.15 : 1.08]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} roughness={0.35} metalness={0.7} {...chassisMat} />
      </mesh>
      {/* Rocker-bogie differential pivot bar & Perseverance Sample Caching belly / RIMFAX aft plate */}
      <mesh position={[0, 0.27, -0.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.88, 12]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.3} {...chassisMat} />
      </mesh>
      {isPerseverance ? (
        <mesh position={[0, -0.15, 0.16]}>
          <boxGeometry args={[0.46, 0.09, 0.52]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.65} roughness={0.38} {...armMat} />
        </mesh>
      ) : (
        <mesh position={[-0.14, 0.27, 0.16]}>
          <cylinderGeometry args={[0.09, 0.09, 0.08, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.35} {...armMat} />
        </mesh>
      )}

      {/* 6 Rocker-Bogie wheels + Titanium struts */}
      <group ref={wheelGroupRef}>
        {wheelPositions.map(([x, y, z], idx) => (
          <group key={idx} position={[x, y, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry
                args={[isPerseverance ? 0.18 : 0.17, isPerseverance ? 0.18 : 0.17, 0.16, 20]}
              />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.darkMetal} roughness={0.7} metalness={0.65} {...chassisMat} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.18, 14]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} roughness={0.35} metalness={0.85} {...chassisMat} />
            </mesh>
            <mesh position={[x > 0 ? -0.14 : 0.14, 0.19, 0]} rotation={[0, 0, x > 0 ? 0.55 : -0.55]}>
              <boxGeometry args={[0.045, 0.38, 0.05]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} roughness={0.35} metalness={0.85} {...chassisMat} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Aft MMRTG Radioisotope Power System with 8 radiating fins & crash cage */}
      <group position={[0, 0.18, -0.7]} rotation={[-0.45, 0, 0]}>
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

      {/* Remote Sensing Mast + SuperCam/ChemCam + Mastcam-Z / Mastcam Optics Head */}
      <group ref={mastRef} position={[0.18, 0.24, 0.36]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.038, 0.045, 0.62, 14]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} roughness={0.35} metalness={0.8} {...mastMat} />
        </mesh>
        {/* MEDA / REMS meteorological booms */}
        <mesh position={[0, 0.34, 0]}>
          <boxGeometry args={[isPerseverance ? 0.34 : 0.26, 0.022, 0.03]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} roughness={0.4} metalness={0.7} {...mastMat} />
        </mesh>
        <group position={[0, 0.62, 0]}>
          <mesh>
            <boxGeometry args={[isPerseverance ? 0.28 : 0.24, 0.14, 0.18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.3} {...mastMat} />
          </mesh>
          {/* SuperCam / ChemCam cyclops aperture */}
          <mesh position={[0, 0.01, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.04, 16]} />
            <meshStandardMaterial
              color={isPerseverance ? '#f43f5e' : '#0ea5e9'}
              opacity={mastMat.opacity}
              transparent={mastMat.transparent}
              emissive={mastMat.emissiveIntensity > 0 ? mastMat.emissive : (isPerseverance ? '#e11d48' : '#0284c7')}
              emissiveIntensity={mastMat.emissiveIntensity > 0 ? mastMat.emissiveIntensity : 0.45}
            />
          </mesh>
          {/* Mastcam-Z dual zoom optics vs Curiosity asymmetric Mastcam */}
          <mesh position={[-0.08, -0.02, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[isPerseverance ? 0.026 : 0.02, isPerseverance ? 0.026 : 0.02, 0.04, 12]} />
            <meshStandardMaterial color="#1e293b" {...mastMat} />
          </mesh>
          <mesh position={[0.08, -0.02, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[isPerseverance ? 0.026 : 0.03, isPerseverance ? 0.026 : 0.03, 0.05, 12]} />
            <meshStandardMaterial color="#1e293b" {...mastMat} />
          </mesh>
        </group>
      </group>

      {/* Forward 5-DOF Robotic Arm + Coring / APXS Turret */}
      <group ref={armRef} position={[-0.08, 0.04, 0.56]}>
        <mesh position={[0, 0, 0.18]} rotation={[0.32, 0, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.44]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.75} roughness={0.35} {...armMat} />
        </mesh>
        <mesh position={[0.02, -0.08, 0.39]}>
          <cylinderGeometry args={[isPerseverance ? 0.16 : 0.13, isPerseverance ? 0.16 : 0.13, 0.15, 16]} />
          <meshStandardMaterial
            color={isPerseverance ? '#ea580c' : '#d97706'}
            metalness={0.65}
            roughness={0.38}
            {...armMat}
          />
        </mesh>
      </group>
    </group>
  );
}

function LunarRegolithPedestal({
  radius = 1.38,
  y = -0.47,
  withWheelTracks = false,
}: {
  radius?: number;
  y?: number;
  withWheelTracks?: boolean;
}) {
  const rockOffsets: Array<[number, number, number, number]> = [
    [-0.82, 0.03, 0.54, 0.065],
    [0.76, 0.025, 0.62, 0.052],
    [-0.64, 0.02, -0.74, 0.048],
    [0.88, 0.035, -0.46, 0.072],
    [0.18, 0.02, 0.92, 0.044],
    [-0.28, 0.022, -0.95, 0.055],
  ];

  return (
    <group position={[0, y, 0]}>
      {/* Sculpted dark-gray lunar regolith display base */}
      <mesh>
        <cylinderGeometry args={[radius, radius * 1.04, 0.045, 40]} />
        <meshStandardMaterial color="#3b3e45" roughness={0.94} metalness={0.06} />
      </mesh>
      {/* Brushed titanium museum display bezel ring */}
      <mesh position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.02, 0.016, 10, 48]} />
        <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.82} />
      </mesh>
      {/* Subtle micro-crater rings on the regolith pad */}
      <mesh position={[-0.42, 0.023, 0.36]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.11, 0.16, 20]} />
        <meshStandardMaterial color="#52565f" roughness={0.95} side={2} />
      </mesh>
      <mesh position={[0.48, 0.023, -0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.13, 18]} />
        <meshStandardMaterial color="#4b4f58" roughness={0.95} side={2} />
      </mesh>
      {/* Parallel rover wheel ruts impressed in regolith */}
      {withWheelTracks &&
        [-0.56, 0.56].map((x) => (
          <mesh key={x} position={[x, 0.024, 0]}>
            <boxGeometry args={[0.15, 0.006, radius * 1.48]} />
            <meshStandardMaterial color="#2d3036" roughness={0.96} />
          </mesh>
        ))}
      {/* Angular lunar basalt clasts & ejecta cobbles */}
      {rockOffsets.map(([rx, ry, rz, rScale], idx) => (
        <mesh key={idx} position={[rx, ry, rz]} rotation={[idx * 0.4, idx * 1.1, idx * 0.3]}>
          <dodecahedronGeometry args={[rScale, 0]} />
          <meshStandardMaterial color={idx % 2 === 0 ? '#686d78' : '#525660'} roughness={0.9} metalness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

function ApolloLrvAssembly({
  kind,
  deviceId,
  activeGroup,
  mastRef,
  wheelGroupRef,
}: {
  kind: 'apollo_lrv' | 'apollo_lrv_deploy';
  deviceId?: string;
  activeGroup: DevicePartGroupId;
  mastRef: React.RefObject<THREE.Group | null>;
  wheelGroupRef: React.RefObject<THREE.Group | null>;
}) {
  const isDeploy = kind === 'apollo_lrv_deploy';
  const isApollo15 = deviceId === 'apollo_15_lrv';
  const isApollo17 = deviceId === 'apollo_17_lrv';
  const mastMat = groupOpacity(activeGroup, 'optics_mast');
  const chassisMat = groupOpacity(activeGroup, 'mobility_chassis');
  const powerMat = groupOpacity(activeGroup, 'power_thermal');
  const payloadMat = groupOpacity(activeGroup, 'payload_science');

  const wheelCoords: Array<[number, number, number]> = [
    [-0.58, -0.25, 0.58],
    [0.58, -0.25, 0.58],
    [-0.58, -0.25, -0.58],
    [0.58, -0.25, -0.58],
  ];

  const spokeAngles = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 6);
  const umbrellaRibAngles = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4);

  return (
    <group>
      <LunarRegolithPedestal radius={1.42} y={-0.47} withWheelTracks={!isDeploy} />

      {/* LM Quadrant 1 Deployment Bay Bulkhead & Braddock-Cunningham Struts (for apollo_lrv_deployment) */}
      {isDeploy && (
        <group position={[0, 0.08, -0.82]}>
          {/* Kapton-gold LM Quadrant 1 bay wall */}
          <mesh position={[0, 0.18, -0.18]}>
            <boxGeometry args={[1.18, 0.88, 0.22]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.82} roughness={0.32} {...chassisMat} />
          </mesh>
          {/* Twin telescoping deployment struts & release tripod */}
          {[-0.38, 0.38].map((sx) => (
            <group key={sx}>
              <mesh position={[sx, 0.14, 0.22]} rotation={[0.62, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.026, 0.88, 12]} />
                <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.28} {...chassisMat} />
              </mesh>
              <mesh position={[sx, 0.42, 0.32]} rotation={[1.05, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.96, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} {...chassisMat} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      <group rotation={[isDeploy ? 0.28 : 0, 0, isDeploy ? -0.14 : 0]}>
        {/* 3-Part Hinged Aluminum 2219 Tubular Spaceframe Chassis */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.84, 0.045, 1.38]} />
          <meshStandardMaterial color="#d8dee9" metalness={0.82} roughness={0.32} {...chassisMat} />
        </mesh>
        {/* Left & Right Longitudinal Tubular Frame Rails & Fold Hinges */}
        {[-0.43, 0.43].map((rx) => (
          <group key={rx}>
            <mesh position={[rx, -0.03, 0]}>
              <boxGeometry args={[0.045, 0.075, 1.44]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.88} roughness={0.26} {...chassisMat} />
            </mesh>
            {[-0.36, 0.36].map((hz) => (
              <mesh key={hz} position={[rx, -0.01, hz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.032, 0.032, 0.08, 12]} />
                <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.8} roughness={0.32} {...chassisMat} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Beaded Floor Pan Stiffening Ribs & Crew Footrests */}
        {[-0.28, -0.14, 0, 0.14, 0.28].map((rz) => (
          <mesh key={rz} position={[0, -0.022, rz]}>
            <boxGeometry args={[0.78, 0.014, 0.028]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.38} {...chassisMat} />
          </mesh>
        ))}
        {[-0.24, 0.24].map((fx) => (
          <mesh key={fx} position={[fx, 0.01, 0.34]} rotation={[-0.45, 0, 0]}>
            <boxGeometry args={[0.18, 0.02, 0.11]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.45} {...chassisMat} />
          </mesh>
        ))}

        {/* 4 Independent Double-Wishbone Suspensions & Woven Piano-Wire Mesh Wheels */}
        <group ref={wheelGroupRef}>
          {wheelCoords.map(([x, y, z], idx) => {
            const sideSign = x > 0 ? 1 : -1;
            const isRearRightApollo17 = isApollo17 && x > 0 && z < 0;
            return (
              <group key={idx} position={[x, y, z]}>
                {/* Upper & Lower A-Arm Wishbones + Coil-over Shock Damper */}
                <mesh position={[-sideSign * 0.14, 0.12, 0]} rotation={[0, 0, sideSign * 0.28]}>
                  <boxGeometry args={[0.24, 0.026, 0.09]} />
                  <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.3} {...chassisMat} />
                </mesh>
                <mesh position={[-sideSign * 0.14, 0.03, 0]} rotation={[0, 0, sideSign * 0.12]}>
                  <boxGeometry args={[0.24, 0.03, 0.12]} />
                  <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.3} {...chassisMat} />
                </mesh>
                <mesh position={[-sideSign * 0.11, 0.14, -0.04]} rotation={[0, 0, sideSign * 0.48]}>
                  <cylinderGeometry args={[0.022, 0.022, 0.24, 10]} />
                  <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.8} roughness={0.32} {...chassisMat} />
                </mesh>
                {/* Harmonic Drive Traction Motor Housing */}
                <mesh position={[-sideSign * 0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.065, 0.065, 0.12, 14]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.78} roughness={0.32} {...chassisMat} />
                </mesh>

                {/* Woven Zinc-Coated Piano-Wire Mesh Tire Torus */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[0.165, 0.052, 14, 28]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.68} roughness={0.62} {...chassisMat} />
                </mesh>
                {/* Outer Titanium Chevron Tread Rings */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.214, 0.214, 0.11, 20, 1, true]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.48} side={2} {...chassisMat} />
                </mesh>
                {/* 12 Radial Titanium Bump-Stop Spokes */}
                {spokeAngles.map((ang, sIdx) => (
                  <mesh key={sIdx} rotation={[ang, 0, 0]}>
                    <boxGeometry args={[0.08, 0.33, 0.016]} />
                    <meshStandardMaterial color="#e2e8f0" metalness={0.82} roughness={0.3} {...chassisMat} />
                  </mesh>
                ))}
                {/* Spun-Aluminum Wheel Hub & Crimson Anodized Cap */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.085, 0.085, 0.135, 16]} />
                  <meshStandardMaterial color="#f1f5f9" metalness={0.85} roughness={0.28} {...chassisMat} />
                </mesh>
                <mesh position={[sideSign * 0.072, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.052, 0.058, 0.022, 16]} />
                  <meshStandardMaterial color="#dc2626" metalness={0.65} roughness={0.35} {...chassisMat} />
                </mesh>

                {/* Curvilinear Fiberglass Dust Fender */}
                <mesh position={[0, 0.21, 0]}>
                  <boxGeometry args={[0.16, 0.025, 0.34]} />
                  <meshStandardMaterial color="#d97706" roughness={0.45} metalness={0.35} {...chassisMat} />
                </mesh>
                <mesh position={[0, 0.17, z > 0 ? -0.17 : 0.17]} rotation={[z > 0 ? 0.55 : -0.55, 0, 0]}>
                  <boxGeometry args={[0.16, 0.022, 0.12]} />
                  <meshStandardMaterial color="#ea580c" roughness={0.45} metalness={0.35} {...chassisMat} />
                </mesh>

                {/* Apollo 17 Iconic Laminated Map & Optical Clamp Replacement Fender Extension */}
                {isRearRightApollo17 && (
                  <group position={[0, 0.14, -0.23]} rotation={[-0.65, 0, 0]}>
                    <mesh>
                      <boxGeometry args={[0.175, 0.018, 0.16]} />
                      <meshStandardMaterial color="#fef08a" roughness={0.55} metalness={0.15} {...payloadMat} />
                    </mesh>
                    <mesh position={[0, 0.014, 0.04]}>
                      <boxGeometry args={[0.15, 0.024, 0.035]} />
                      <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} {...payloadMat} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>

        {/* Twin Tubular Lawn-Chair Crew Seats with Multi-Strap Dacron Webbing & Armrests */}
        {[-0.23, 0.23].map((x) => (
          <group key={x} position={[x, 0.08, -0.04]}>
            {/* Seat bottom frame & 4 woven nylon straps */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.28, 0.025, 0.28]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.8} roughness={0.3} {...chassisMat} />
            </mesh>
            {[-0.09, -0.03, 0.03, 0.09].map((sz) => (
              <mesh key={sz} position={[0, 0.018, sz]}>
                <boxGeometry args={[0.25, 0.012, 0.042]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.82} {...chassisMat} />
              </mesh>
            ))}
            {/* Seat backrest tubular uprights & 5 woven backrest straps */}
            {[-0.12, 0.12].map((bx) => (
              <mesh key={bx} position={[bx, 0.19, -0.13]} rotation={[-0.1, 0, 0]}>
                <cylinderGeometry args={[0.014, 0.014, 0.38, 10]} />
                <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.28} {...chassisMat} />
              </mesh>
            ))}
            {[0.06, 0.13, 0.2, 0.27, 0.34].map((by) => (
              <mesh key={by} position={[0, by, -0.13]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.24, 0.045, 0.018]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} {...chassisMat} />
              </mesh>
            ))}
            {/* Orange Life-Support PLSS Backrest Spacer & Seatbelt Harness */}
            <mesh position={[0, 0.18, -0.115]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.14, 0.22, 0.022]} />
              <meshStandardMaterial color="#ea580c" roughness={0.6} {...chassisMat} />
            </mesh>
            {/* Outboard Toe-Hold & Inboard Armrest */}
            <mesh position={[x > 0 ? 0.14 : -0.14, 0.11, -0.02]}>
              <boxGeometry args={[0.025, 0.025, 0.22]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.8} {...chassisMat} />
            </mesh>
          </group>
        ))}

        {/* Center Control & Display Console (CDU), Gyro Navigation Rose & T-Handle Hand Controller */}
        <group position={[0, 0.14, 0.14]}>
          {/* Console Pedestal Post */}
          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[0.12, 0.18, 0.16]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} {...payloadMat} />
          </mesh>
          {/* Angled Black Anodized CDU Instrument Bezel */}
          <mesh position={[0, 0.08, 0.04]} rotation={[-0.52, 0, 0]}>
            <boxGeometry args={[0.19, 0.16, 0.04]} />
            <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.35} {...payloadMat} />
          </mesh>
          {/* Attitude / Heading Gyro Dials & Sun-Shadow Clinometer */}
          {[-0.045, 0.045].map((dx) => (
            <mesh key={dx} position={[dx, 0.095, 0.062]} rotation={[Math.PI / 2 - 0.52, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.012, 14]} />
              <meshStandardMaterial color="#38bdf8" {...payloadMat} />
            </mesh>
          ))}
          {/* T-Handle Drive & Steering Controller */}
          <mesh position={[0, 0.06, -0.05]} rotation={[0.28, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.014, 0.16, 10]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} {...payloadMat} />
          </mesh>
          <mesh position={[0, 0.135, -0.03]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.095, 10]} />
            <meshStandardMaterial color="#ea580c" roughness={0.45} {...payloadMat} />
          </mesh>
        </group>

        {/* Apollo 15 16mm Data Acquisition Camera (DAC) on Starboard Stanchion */}
        {isApollo15 && (
          <group position={[0.36, 0.28, 0.12]}>
            <mesh>
              <cylinderGeometry args={[0.01, 0.01, 0.24, 8]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} {...mastMat} />
            </mesh>
            <mesh position={[0, 0.13, 0.02]}>
              <boxGeometry args={[0.06, 0.07, 0.11]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.6} roughness={0.3} {...mastMat} />
            </mesh>
          </group>
        )}

        {/* Forward Silver-Zinc Battery Boxes (Bat 1 & Bat 2), Thermal Mirror Louvers & LCRU */}
        <group position={[0, 0.05, 0.55]}>
          {/* Twin AgZn Battery Enclosures */}
          {[-0.18, 0.18].map((bx) => (
            <group key={bx} position={[bx, 0.02, 0]}>
              <mesh>
                <boxGeometry args={[0.31, 0.16, 0.26]} />
                <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.82} roughness={0.28} {...powerMat} />
              </mesh>
              {/* Fused-Silica Optical Solar Reflector Thermal Louver Blades */}
              {[-0.06, 0, 0.06].map((lz) => (
                <mesh key={lz} position={[0, 0.086, lz]} rotation={[0.18, 0, 0]}>
                  <boxGeometry args={[0.27, 0.008, 0.048]} />
                  <meshStandardMaterial color="#e0f2fe" metalness={0.92} roughness={0.12} {...powerMat} />
                </mesh>
              ))}
            </group>
          ))}
          {/* Forward LCRU (Lunar Communications Relay Unit) Thermal Blanket Trunk */}
          <mesh position={[0.02, 0.02, 0.19]}>
            <boxGeometry args={[0.36, 0.14, 0.11]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.85} roughness={0.25} {...powerMat} />
          </mesh>
          <mesh position={[0.02, 0.02, 0.248]}>
            <boxGeometry args={[0.28, 0.09, 0.01]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.95} roughness={0.1} {...powerMat} />
          </mesh>
        </group>

        {/* Forward Articulated Mast: 12-Rib S-Band Parabolic High-Gain Umbrella Antenna, Low-Gain Helix & Color TV Camera */}
        <group ref={mastRef} position={[0, 0.14, 0.54]}>
          {/* Port High-Gain Dish Support Mast */}
          <mesh position={[-0.24, 0.24, 0]}>
            <cylinderGeometry args={[0.016, 0.018, 0.48, 12]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.88} roughness={0.25} {...mastMat} />
          </mesh>
          {/* Parabolic 12-Rib S-Band Umbrella Dish + Feed Horn */}
          <group position={[-0.24, 0.5, 0.05]} rotation={[0.82, 0.12, 0]}>
            <mesh>
              <coneGeometry args={[0.31, 0.13, 24, 1, true]} />
              <meshStandardMaterial
                color={SUBSYSTEM_COLORS.kaptonGold}
                roughness={0.42}
                metalness={0.78}
                side={2}
                {...mastMat}
              />
            </mesh>
            {/* Radial structural umbrella ribs */}
            {umbrellaRibAngles.map((ang, rIdx) => (
              <mesh key={rIdx} position={[0, -0.02, 0]} rotation={[0, ang, 0]}>
                <boxGeometry args={[0.6, 0.008, 0.008]} />
                <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.9} roughness={0.2} {...mastMat} />
              </mesh>
            ))}
            {/* Central S-Band Feed Horn Stalk & Optical Aiming Sight */}
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.012, 0.022, 0.22, 12]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.85} roughness={0.22} {...mastMat} />
            </mesh>
          </group>

          {/* Starboard Westinghouse Color TV Camera on Pan/Tilt Gimbal + Low-Gain Helical Antenna */}
          <mesh position={[0.24, 0.14, 0.04]}>
            <cylinderGeometry args={[0.014, 0.016, 0.28, 10]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} {...mastMat} />
          </mesh>
          <group position={[0.24, 0.28, 0.06]}>
            <mesh>
              <boxGeometry args={[0.11, 0.095, 0.2]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.82} roughness={0.28} {...mastMat} />
            </mesh>
            {/* TV Zoom Lens Barrel & Glare Shield */}
            <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.032, 0.036, 0.08, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} {...mastMat} />
            </mesh>
            <mesh position={[0, 0, 0.172]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.01, 14]} />
              <meshStandardMaterial color="#38bdf8" {...mastMat} />
            </mesh>
          </group>
          {/* Low-Gain S-Band Helical Antenna */}
          <mesh position={[0.06, 0.22, 0.14]}>
            <cylinderGeometry args={[0.01, 0.012, 0.36, 10]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.25} {...mastMat} />
          </mesh>
        </group>

        {/* Aft Geological Hand Tool Carrier (HTC), Sample Bags & Mission-Specific Science Instruments */}
        <group position={[0, 0.11, -0.54]}>
          {/* Main Aft Aluminum Tool Carrier Frame */}
          <mesh>
            <boxGeometry args={[0.7, 0.19, 0.26]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.72} roughness={0.38} {...payloadMat} />
          </mesh>
          {/* Core Sample Tubes & Geology Hammer / Scoop Stanchions */}
          {[-0.26, -0.16, -0.06].map((tx) => (
            <mesh key={tx} position={[tx, 0.16, -0.06]}>
              <cylinderGeometry args={[0.012, 0.012, 0.28, 10]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.88} roughness={0.22} {...payloadMat} />
            </mesh>
          ))}
          {/* White Sample Return Bag Dispenser */}
          <mesh position={[0.2, 0.14, 0]}>
            <boxGeometry args={[0.22, 0.12, 0.18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.65} {...payloadMat} />
          </mesh>
          {/* Apollo 17 Traverse Gravimeter Experiment (TGE) & SEP Loop Antenna vs Apollo 15 Rake */}
          {isApollo17 ? (
            <group position={[0, 0.16, 0.02]}>
              {/* Traverse Gravimeter Cylinder */}
              <mesh position={[-0.02, 0, 0.04]}>
                <cylinderGeometry args={[0.075, 0.075, 0.16, 16]} />
                <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.82} roughness={0.28} {...payloadMat} />
              </mesh>
              {/* SEP (Surface Electrical Properties) Receiver Mast & Cross-Loop */}
              <mesh position={[0.28, 0.22, -0.08]}>
                <cylinderGeometry args={[0.01, 0.01, 0.42, 8]} />
                <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} {...payloadMat} />
              </mesh>
              <mesh position={[0.28, 0.42, -0.08]} rotation={[0, Math.PI / 4, 0]}>
                <torusGeometry args={[0.09, 0.008, 8, 20]} />
                <meshStandardMaterial color="#38bdf8" metalness={0.8} {...payloadMat} />
              </mesh>
            </group>
          ) : (
            <group position={[0.18, 0.18, -0.08]}>
              {/* Hadley Rille Soil Rake & Penetrometer */}
              <mesh rotation={[0, 0, 0.35]}>
                <boxGeometry args={[0.2, 0.08, 0.02]} />
                <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} {...payloadMat} />
              </mesh>
            </group>
          )}
        </group>
      </group>
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
    const rtgFins = [0, 1, 2, 3].map((i) => (i * Math.PI) / 4);
    const cubeGrid = [-0.14, -0.07, 0, 0.07, 0.14];

    return (
      <group>
        <LunarRegolithPedestal radius={1.45} y={-0.38} withWheelTracks={false} />

        {/* Flat Kapton Ribbon Interconnect Cables radiating from Central Station */}
        {[
          [-0.36, -0.34, 0.04, 0.58, 0.12],
          [0.34, -0.34, -0.12, 0.52, -0.35],
          [0.12, -0.34, 0.36, 0.48, 1.32],
        ].map(([cx, cy, cz, len, rotY], idx) => (
          <mesh key={idx} position={[cx, cy, cz]} rotation={[0, rotY, 0]}>
            <boxGeometry args={[len, 0.008, 0.028]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.45} metalness={0.5} {...powerMat} />
          </mesh>
        ))}

        {/* 1. ALSEP Central Station Electronics Trunk, Thermal Plate & S-Band Helical Telemetry Mast */}
        <group position={[0.06, -0.18, -0.14]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.52, 0.28, 0.44]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.82} roughness={0.28} {...payloadMat} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.56, 0.025, 0.48]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.deckWhite} roughness={0.32} metalness={0.45} {...payloadMat} />
          </mesh>
          {/* S-Band Helical Telemetry Antenna & Dual-Gimbal Post */}
          <mesh position={[0.18, 0.42, -0.12]}>
            <cylinderGeometry args={[0.016, 0.022, 0.56, 12]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.88} roughness={0.25} {...opticsMat} />
          </mesh>
          <mesh position={[0.18, 0.72, -0.12]}>
            <cylinderGeometry args={[0.028, 0.028, 0.18, 14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.5} {...opticsMat} />
          </mesh>
        </group>

        {/* 2. Laser Ranging Retroreflector (LRRR) Pallet with 25 Recessed Fused-Silica Corner Cubes */}
        <group position={[-0.12, -0.14, 0.38]} rotation={[-0.42, 0.18, 0]}>
          <mesh>
            <boxGeometry args={[0.46, 0.07, 0.42]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.deckWhite} roughness={0.38} metalness={0.4} {...payloadMat} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.38, 0.02, 0.36]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.85} {...opticsMat} />
          </mesh>
          {cubeGrid.map((gx) =>
            cubeGrid.map((gz) => (
              <mesh key={`${gx}-${gz}`} position={[gx, 0.052, gz]} rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.024, 0.018, 0.014, 6]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  metalness={0.95}
                  roughness={0.08}
                  {...opticsMat}
                />
              </mesh>
            )),
          )}
        </group>

        {/* 3. SNAP-27 Radioisotope Thermoelectric Generator (RTG) with 8 Radial Beryllium Cooling Fins */}
        <group position={[-0.68, -0.1, 0.08]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.46, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.82} roughness={0.32} {...powerMat} />
          </mesh>
          {rtgFins.map((ang, fIdx) => (
            <mesh key={fIdx} rotation={[0, ang, 0]}>
              <boxGeometry args={[0.38, 0.42, 0.018]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.78} roughness={0.32} {...powerMat} />
            </mesh>
          ))}
          <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.07, 0.012, 8, 18, Math.PI]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.88} {...powerMat} />
          </mesh>
        </group>

        {/* 4. Passive Seismic Experiment (PSE) with Circular Gold Mylar Thermal Skirt */}
        <group position={[0.64, -0.31, 0.2]}>
          <mesh>
            <cylinderGeometry args={[0.32, 0.35, 0.025, 24]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.85} roughness={0.26} {...chassisMat} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.16, 16]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.25} {...payloadMat} />
          </mesh>
        </group>

        {/* 5. Solar Wind Spectrometer (SWS) Tripod & Heat Flow Bore-Stem Probe */}
        <group position={[0.58, -0.18, -0.34]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.09, 0.06, 0.12, 12]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.deckWhite} metalness={0.5} roughness={0.35} {...payloadMat} />
          </mesh>
          {[-0.08, 0.08].map((lx) => (
            <mesh key={lx} position={[lx, -0.06, 0]} rotation={[0, 0, lx > 0 ? 0.35 : -0.35]}>
              <cylinderGeometry args={[0.01, 0.01, 0.26, 8]} />
              <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} {...chassisMat} />
            </mesh>
          ))}
        </group>
      </group>
    );
  }

  // apollo_lm_mesa: Detailed LM Descent Stage Quadrant IV + 9-Rung Egress Ladder + Landing Gear Footpad + Deployed MESA Workbench
  const ladderRungs = [-0.22, -0.14, -0.06, 0.02, 0.1, 0.18, 0.26, 0.34, 0.42];

  return (
    <group>
      <LunarRegolithPedestal radius={1.45} y={-0.47} withWheelTracks={false} />

      {/* Octagonal Kapton-Gold & Black-Inconel LM Descent Stage Quadrant IV Hull */}
      <group position={[-0.08, 0.14, -0.26]}>
        <mesh>
          <boxGeometry args={[1.12, 0.92, 0.58]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.84} roughness={0.28} {...chassisMat} />
        </mesh>
        {/* Amber/Copper Foil & Black Inconel Heat Shield Panels */}
        <mesh position={[-0.32, -0.18, 0.295]}>
          <boxGeometry args={[0.42, 0.48, 0.015]} />
          <meshStandardMaterial color="#b45309" metalness={0.78} roughness={0.32} {...chassisMat} />
        </mesh>
        <mesh position={[0.32, 0.22, 0.295]}>
          <boxGeometry args={[0.4, 0.36, 0.015]} />
          <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.38} {...chassisMat} />
        </mesh>
        {/* Top Deck Ascent Stage Interface Ring */}
        <mesh position={[0, 0.47, 0]}>
          <cylinderGeometry args={[0.52, 0.56, 0.05, 16]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.28} {...chassisMat} />
        </mesh>
      </group>

      {/* Forward Outrigger Truss, Primary Landing Gear Strut, Dish Footpad & Surface Contact Probe */}
      <group position={[0.56, -0.06, 0.14]}>
        {/* Primary Shock-Absorber Oleo Cylinder */}
        <mesh position={[0, 0.08, 0]} rotation={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.042, 0.036, 0.72, 14]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.82} roughness={0.3} {...powerMat} />
        </mesh>
        {/* Secondary Diagonal A-Frame Struts */}
        <mesh position={[-0.18, 0.04, -0.12]} rotation={[0.25, 0, -0.58]}>
          <cylinderGeometry args={[0.02, 0.02, 0.56, 10]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.28} {...chassisMat} />
        </mesh>
        <mesh position={[-0.18, 0.04, 0.12]} rotation={[-0.25, 0, -0.58]}>
          <cylinderGeometry args={[0.02, 0.02, 0.56, 10]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.28} {...chassisMat} />
        </mesh>
        {/* Spun-Aluminum Crushable Honeycomb Dish Footpad (Ø 94 cm) */}
        <mesh position={[0.04, -0.34, 0]}>
          <cylinderGeometry args={[0.24, 0.3, 0.075, 24]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.8} roughness={0.34} {...powerMat} />
        </mesh>
        {/* Bent Lunar Contact Sensing Probe */}
        <mesh position={[0.16, -0.37, 0.08]} rotation={[0, 0, 1.15]}>
          <cylinderGeometry args={[0.008, 0.008, 0.28, 8]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.9} {...powerMat} />
        </mesh>
      </group>

      {/* 9-Rung Forward Egress Ladder & Stainless-Steel Commemorative Plaque */}
      <group position={[0.42, 0.08, 0.18]} rotation={[0.14, 0.35, 0]}>
        {[-0.11, 0.11].map((lx) => (
          <mesh key={lx} position={[lx, 0.1, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.78, 10]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.88} roughness={0.24} {...chassisMat} />
          </mesh>
        ))}
        {ladderRungs.map((ry, rIdx) => (
          <mesh key={rIdx} position={[0, ry, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.009, 0.009, 0.22, 10]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.88} roughness={0.24} {...chassisMat} />
          </mesh>
        ))}
        {/* Commemorative Plaque between 3rd and 4th rungs */}
        <mesh position={[0, -0.02, 0.012]}>
          <boxGeometry args={[0.16, 0.065, 0.008]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.12} {...payloadMat} />
        </mesh>
      </group>

      {/* Deployed Modularized Equipment Stowage Assembly (MESA) Workbench Pallet */}
      <group position={[-0.18, -0.08, 0.34]} rotation={[0.38, 0, 0]}>
        {/* Aluminum Honeycomb MESA Tray Frame */}
        <mesh>
          <boxGeometry args={[0.84, 0.06, 0.58]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.deckWhite} metalness={0.55} roughness={0.36} {...payloadMat} />
        </mesh>
        {/* Apollo Lunar Sample Return Container (ALSRC Rock Box) */}
        <mesh position={[0.16, 0.09, -0.04]}>
          <boxGeometry args={[0.32, 0.14, 0.24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} {...payloadMat} />
        </mesh>
        {/* Twin LiOH Environmental Scrubber Canister Cases */}
        {[-0.22, -0.06].map((cx) => (
          <mesh key={cx} position={[cx, 0.08, 0.08]}>
            <cylinderGeometry args={[0.055, 0.055, 0.14, 14]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.8} roughness={0.3} {...powerMat} />
          </mesh>
        ))}
        {/* MESA Swing-Out Westinghouse TV Camera Bracket aimed toward the Ladder */}
        <group position={[-0.28, 0.09, 0.22]} rotation={[-0.15, 0.42, 0]}>
          <mesh>
            <boxGeometry args={[0.13, 0.1, 0.22]} />
            <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.85} roughness={0.26} {...opticsMat} />
          </mesh>
          <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.036, 0.07, 14]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.25} {...opticsMat} />
          </mesh>
        </group>
      </group>
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
          <cylinderGeometry args={[0.18, 0.2, 1.45, 24]} />
          <meshStandardMaterial color="#dbeafe" metalness={0.78} roughness={0.28} />
        </mesh>
        <group ref={spinRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.65, 0.085, 16, 48]} />
            <meshStandardMaterial color="#b9cbe2" metalness={0.8} roughness={0.3} />
          </mesh>
          {[0, 1, 2, 3].map((idx) => (
            <mesh key={idx} rotation={[0, 0, (idx * Math.PI) / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 1.24, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.28} />
            </mesh>
          ))}
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
    const rcsAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    return (
      <group rotation={[0.18, 0.42, 0]}>
        {/* Block II Cylindrical Service Module (SM) with White Radiator Sectors */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.74, 28]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.28} />
        </mesh>
        {/* Open SIM (Scientific Instrument Module) Bay & Deployed Gamma-Ray Boom */}
        <mesh position={[0.31, -0.1, 0]}>
          <boxGeometry args={[0.08, 0.48, 0.18]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.58, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.52, 10]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.9} />
        </mesh>
        {/* 4 Radial Service Module RCS Thruster Quads */}
        {rcsAngles.map((ang, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(ang) * 0.36, 0.12, Math.sin(ang) * 0.36]}
            rotation={[0, -ang, 0]}
          >
            <boxGeometry args={[0.06, 0.11, 0.08]} />
            <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
          </mesh>
        ))}
        {/* Conical Mylar/Steel Command Module (CM) Crew Cabin & Forward Docking Probe */}
        <mesh position={[0, 0.44, 0]}>
          <coneGeometry args={[0.34, 0.38, 28]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.74} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.025, 0.055, 0.14, 14]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Aft AJ10-137 Service Propulsion System (SPS) Engine Bell & S-Band High-Gain Dish Array */}
        <mesh position={[0, -0.68, 0]}>
          <cylinderGeometry args={[0.08, 0.25, 0.38, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.82} roughness={0.34} />
        </mesh>
        <mesh position={[-0.24, -0.56, 0.18]} rotation={[0.45, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.03, 16]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    );
  }

  // orbiter_science: LRO / MAVEN / Odyssey class polar science orbiter
  return (
    <group>
      {/* Multi-foil Kapton Spacecraft Bus */}
      <mesh>
        <boxGeometry args={[0.46, 0.58, 0.46]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.kaptonGold} metalness={0.85} roughness={0.28} />
      </mesh>
      {/* Nadir Optical Bench: LROC Twin NACs + LOLA 5-Beam Altimeter + THEMIS / Diviner Turret */}
      <mesh position={[0.1, -0.14, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.14, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[-0.08, -0.14, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.14, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.12, 0.25]}>
        <boxGeometry args={[0.24, 0.14, 0.08]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.65} roughness={0.3} />
      </mesh>
      {/* High-Gain S/Ka-Band Parabolic Dish & Feed Horn */}
      <group position={[0, 0.44, 0.08]} rotation={[0.35, 0, 0]}>
        <mesh>
          <coneGeometry args={[0.35, 0.14, 24, 1, true]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.55} roughness={0.35} side={2} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.018, 0.025, 0.18, 12]} />
          <meshStandardMaterial color={SUBSYSTEM_COLORS.metal} metalness={0.88} />
        </mesh>
      </group>
      {/* Articulated GaAs Solar Array Wings */}
      <mesh position={[0.74, 0, 0]}>
        <boxGeometry args={[0.92, 0.03, 0.34]} />
        <meshStandardMaterial color={SUBSYSTEM_COLORS.solarBlue} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.74, 0, 0]}>
        <boxGeometry args={[0.92, 0.03, 0.34]} />
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
export function ProceduralDeviceModel({ kind, deviceId }: ProceduralDeviceModelProps) {
  const activePartGroupId = useCosmosStore((state) => state.activePartGroupId);
  const rotorStepDeg = useCosmosStore((state) => state.rotorStepDeg);
  const mastRef = useRef<THREE.Group | null>(null);
  const armRef = useRef<THREE.Group | null>(null);
  const wheelRef = useRef<THREE.Group | null>(null);

  useFrame((state, delta) => {
    const mode = useCosmosStore.getState().rotorSpinMode;
    if (mastRef.current) {
      if (mode === 'demo_slow') {
        mastRef.current.rotation.y += Math.min(delta, 0.05) * 0.7;
      } else {
        mastRef.current.rotation.y = MathUtils.degToRad(rotorStepDeg);
      }
    }
    if (armRef.current && mode === 'demo_slow') {
      armRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.4) * 0.16;
    } else if (armRef.current) {
      armRef.current.rotation.x = 0;
    }
    if (wheelRef.current && mode === 'demo_slow') {
      wheelRef.current.rotation.z += Math.min(delta, 0.05) * 0.6;
    }
  });

  return (
    <group>
      {kind === 'mars_rover_rtg' && (
        <MarsRoverAssembly
          deviceId={deviceId}
          activeGroup={activePartGroupId}
          mastRef={mastRef}
          armRef={armRef}
          wheelGroupRef={wheelRef}
        />
      )}
      {(kind === 'apollo_lrv' || kind === 'apollo_lrv_deploy') && (
        <ApolloLrvAssembly
          kind={kind}
          deviceId={deviceId}
          activeGroup={activePartGroupId}
          mastRef={mastRef}
          wheelGroupRef={wheelRef}
        />
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
