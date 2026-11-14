import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DEVICE_CATALOG } from '../../config/deviceCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';
import type { BodyId, ProceduralModelKind, SensorFilterMode } from '../../types/cosmos.types';
import { DeepSpaceStarfield } from '../environment/DeepSpaceStarfield';
import { MarsTerrainPatch } from '../surface/MarsTerrainPatch';

type CockpitFrameKind =
  | 'rover_mast'
  | 'helicopter_rte'
  | 'lander_deck'
  | 'apollo_lrv_cockpit'
  | 'survey_tripod'
  | 'orbital_cupola';

function resolveCockpitKind(
  deviceId: string | null,
  proceduralKind: ProceduralModelKind | undefined,
  targetCategory: string | undefined,
): CockpitFrameKind {
  if (deviceId) {
    if (
      deviceId === 'mro_orbiter' ||
      deviceId === 'dawn_spacecraft' ||
      deviceId === 'near_shoemaker' ||
      deviceId === 'pioneer_10' ||
      deviceId === 'kepler_space_telescope'
    ) {
      return 'orbital_cupola';
    }
    if (deviceId === 'ingenuity_helicopter') return 'helicopter_rte';
    if (deviceId === 'insight_lander' || deviceId === 'viking_lander') return 'lander_deck';
    if (proceduralKind?.startsWith('apollo_lrv')) return 'apollo_lrv_cockpit';
    if (proceduralKind === 'apollo_lm_mesa' || proceduralKind === 'apollo_surface_pack') {
      return 'survey_tripod';
    }
    return 'rover_mast';
  }

  if (targetCategory === 'MOON' || targetCategory === 'SPACECRAFT') {
    return 'orbital_cupola';
  }
  return 'survey_tripod';
}

function OnboardHardwareFrame({ kind }: { kind: CockpitFrameKind }) {
  const armDeployed = useCosmosStore((state) => state.povArmDeployed);
  const scanActive = useCosmosStore((state) => state.povScanActive);
  const armPivotRef = useRef<THREE.Group | null>(null);
  const beamRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (armPivotRef.current) {
      const targetAngle = armDeployed ? -0.34 : 0.22;
      const targetForwardZ = armDeployed ? -0.42 : 0;
      armPivotRef.current.rotation.x = THREE.MathUtils.lerp(
        armPivotRef.current.rotation.x,
        targetAngle,
        dt * 5.5,
      );
      armPivotRef.current.position.z = THREE.MathUtils.lerp(
        armPivotRef.current.position.z,
        targetForwardZ,
        dt * 5.5,
      );
    }

    if (scanActive && ringRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.16;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
    if (scanActive && beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 9) * 0.25;
    }
  });

  if (kind === 'orbital_cupola') {
    return (
      <group>
        <group position={[0, 0, -1.6]}>
          {/* Cupola window radial mullions (framing the planet below without blocking center view) */}
          <mesh position={[0, -0.68, 0]}>
            <boxGeometry args={[2.6, 0.14, 0.25]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[2.6, 0.1, 0.2]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[-1.08, 0, 0]} rotation={[0, 0, -0.15]}>
            <boxGeometry args={[0.1, 1.5, 0.2]} />
            <meshStandardMaterial color="#334155" metalness={0.82} roughness={0.3} />
          </mesh>
          <mesh position={[1.08, 0, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[0.1, 1.5, 0.2]} />
            <meshStandardMaterial color="#334155" metalness={0.82} roughness={0.3} />
          </mesh>
          {/* Illuminated cockpit status rail */}
          <mesh position={[0, -0.58, 0.08]}>
            <boxGeometry args={[1.4, 0.03, 0.05]} />
            <meshStandardMaterial
              color={scanActive ? '#34d399' : '#38bdf8'}
              emissive={scanActive ? '#10b981' : '#0284c7'}
              emissiveIntensity={scanActive ? 1.5 : 0.9}
            />
          </mesh>
          {/* Extendable cupola nadir sensor boom */}
          <group ref={armPivotRef} position={[0.42, -0.52, -0.1]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.03, 0.68, 12]} />
              <meshStandardMaterial color="#d4a12a" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        </group>

        {scanActive && (
          <group>
            <mesh ref={beamRef} position={[0, -0.55, -2.95]} rotation={[Math.PI / 2.2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.04, 2.5, 10]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
            </mesh>
            <mesh ref={ringRef} position={[0, -0.95, -4.1]} rotation={[-0.25, 0, 0]}>
              <torusGeometry args={[0.32, 0.02, 10, 28]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  return (
    <group>
      {/* Articulated Robotic Instrument Arm / Sample Turret */}
      <group ref={armPivotRef} position={[0.24, 0.44, -0.82]}>
        <mesh position={[0, 0, -0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.032, 0.56, 12]} />
          <meshStandardMaterial color="#d4a12a" metalness={0.78} roughness={0.32} />
        </mesh>
        <mesh position={[0, -0.02, -0.55]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
          <meshStandardMaterial
            color={scanActive ? '#22d3ee' : '#ea580c'}
            metalness={0.68}
            roughness={0.35}
            emissive={scanActive ? '#06b6d4' : '#000000'}
            emissiveIntensity={scanActive ? 0.6 : 0}
          />
        </mesh>
      </group>

      {/* Active Laser Spectrometer / Radar Target Beam onto Terrain */}
      {scanActive && (
        <group>
          <mesh ref={beamRef} position={[0.1, 0.25, -2.35]} rotation={[Math.PI / 2 + 0.12, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.028, 2.9, 10]} />
            <meshBasicMaterial color="#34d399" transparent opacity={0.72} />
          </mesh>
          <mesh ref={ringRef} position={[0, 0.05, -3.75]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.022, 10, 28]} />
            <meshBasicMaterial color="#34d399" transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      {kind === 'helicopter_rte' && (
        <group position={[0, 0.26, -0.3]}>
          {/* Forward skids visible below RTE horizon cam */}
          <mesh position={[-0.36, -0.2, -0.45]} rotation={[0.2, -0.35, -0.25]}>
            <cylinderGeometry args={[0.014, 0.014, 0.75, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[0.36, -0.2, -0.45]} rotation={[0.2, 0.35, 0.25]}>
            <cylinderGeometry args={[0.014, 0.014, 0.75, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.42, 0.04, 0.22]} />
            <meshStandardMaterial color="#d4a12a" metalness={0.75} roughness={0.35} />
          </mesh>
        </group>
      )}

      {kind === 'lander_deck' && (
        <group position={[0, 0.52, -0.45]}>
          {/* Polygonal lander top deck & gold thermal rim */}
          <mesh position={[0, -0.18, -0.32]}>
            <cylinderGeometry args={[0.92, 0.96, 0.08, 8]} />
            <meshStandardMaterial color="#d4a12a" metalness={0.75} roughness={0.35} />
          </mesh>
          {/* Deployed IDA grapple boom ahead */}
          <mesh position={[0.24, -0.05, -0.95]} rotation={[-0.2, -0.15, 0]}>
            <boxGeometry args={[0.07, 0.07, 1.15]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Left/Right circular solar wing edges */}
          <mesh position={[-1.25, -0.22, -0.35]}>
            <cylinderGeometry args={[0.58, 0.58, 0.03, 12]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[1.25, -0.22, -0.35]}>
            <cylinderGeometry args={[0.58, 0.58, 0.03, 12]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      )}

      {kind === 'apollo_lrv_cockpit' && (
        <group position={[0, 0.48, -0.4]}>
          {/* LRV forward console & iconic T-handle drive controller */}
          <mesh position={[0, -0.12, -0.42]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.52, 0.16, 0.26]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.78} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.06, -0.18]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.3, 10]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, -0.12]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.14, 10]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {/* Front wire-mesh wheels with orange fenders */}
          {[-0.65, 0.65].map((x) => (
            <mesh key={x} position={[x, -0.36, -0.92]}>
              <boxGeometry args={[0.24, 0.05, 0.42]} />
              <meshStandardMaterial color="#ea580c" roughness={0.45} />
            </mesh>
          ))}
        </group>
      )}

      {kind === 'survey_tripod' && (
        <group position={[0, 0.52, -0.35]}>
          <mesh position={[-0.35, -0.46, -0.45]} rotation={[0.28, 0, -0.35]}>
            <cylinderGeometry args={[0.02, 0.024, 1.0, 10]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[0.35, -0.46, -0.45]} rotation={[0.28, 0, 0.35]}>
            <cylinderGeometry args={[0.02, 0.024, 1.0, 10]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.35} />
          </mesh>
          {/* Brass calibration gnomon disc ahead on ground */}
          <mesh position={[0.26, -0.42, -1.05]}>
            <cylinderGeometry args={[0.14, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#d4a12a" metalness={0.75} roughness={0.3} />
          </mesh>
        </group>
      )}

      {kind === 'rover_mast' && (
        <group position={[0, 0.56, -0.38]}>
          {/* White rover top deck & gold foil electronics housing */}
          <mesh position={[0, -0.26, -0.35]}>
            <boxGeometry args={[0.96, 0.14, 1.05]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.45} metalness={0.35} />
          </mesh>
          <mesh position={[0, -0.17, -0.45]}>
            <boxGeometry args={[0.78, 0.05, 0.78]} />
            <meshStandardMaterial color="#d4a12a" roughness={0.35} metalness={0.72} />
          </mesh>
          {/* Mastcam stereo optics bar just below eye line */}
          <mesh position={[0, 0.25, -0.28]}>
            <boxGeometry args={[0.38, 0.08, 0.12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Front-left & front-right Rocker-Bogie wheels */}
          {[-0.68, 0.68].map((x) => (
            <mesh key={x} position={[x, -0.42, -0.95]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.18, 18]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function OrbitalCupolaBody({
  bodyId,
  sensorMode,
}: {
  bodyId: BodyId;
  sensorMode: SensorFilterMode;
}) {
  const palette = useMemo(() => {
    if (sensorMode === 'NAVCAM_MONO') return '#94a3b8';
    if (sensorMode === 'ELEVATION_GRID') return '#38bdf8';
    if (sensorMode === 'THERMAL_FALSE') return '#f97316';
    return bodyId === 'mars' ? '#c1653c' : '#8a8d94';
  }, [bodyId, sensorMode]);

  return (
    <group position={[0, -1.35, -5.8]}>
      <mesh rotation={[0.25, 0.4, 0.15]}>
        <sphereGeometry args={[3.2, 64, 48]} />
        <meshStandardMaterial
          color={palette}
          roughness={0.86}
          metalness={0.05}
          wireframe={sensorMode === 'ELEVATION_GRID'}
        />
      </mesh>
      {bodyId === 'mars' && sensorMode !== 'ELEVATION_GRID' && (
        <mesh>
          <sphereGeometry args={[3.34, 48, 36]} />
          <meshBasicMaterial color="#ff8f5c" transparent opacity={0.14} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

/**
 * Option 2 (`CONTROL_ROOM_POV`) scene:
 * Places the camera inside a stationary onboard hardware deck / cupola frame above
 * the baked 3D `MarsTerrainPatch` (or rotating planet for orbiters) and wires pointer drag pan-tilt.
 */
export function ControlRoomFirstPersonScene() {
  const { gl } = useThree();
  const bodyId = useCosmosStore((state) => state.activeBodyId);
  const deviceId = useCosmosStore((state) => state.activeDeviceId);
  const activeTarget = useCosmosStore((state) => state.activeTarget);
  const povSensorMode = useCosmosStore((state) => state.povSensorMode);

  const [groundY, setGroundY] = useState(0);
  const dragStateRef = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  const device = useMemo(
    () => DEVICE_CATALOG.find((item) => item.id === deviceId),
    [deviceId],
  );
  const cockpitKind = resolveCockpitKind(
    device?.id ?? null,
    device?.proceduralModel,
    activeTarget?.category,
  );
  const isOrbital = cockpitKind === 'orbital_cupola';
  const locationKey = device?.id ?? activeTarget?.id ?? bodyId;

  const handleSurfaceReady = useCallback((sampledGroundY: number) => {
    setGroundY(sampledGroundY);
  }, []);

  useEffect(() => {
    const dom = gl.domElement;
    const onPointerDown = (e: PointerEvent) => {
      dragStateRef.current = { active: true, x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragStateRef.current.active) return;
      const dx = e.clientX - dragStateRef.current.x;
      const dy = e.clientY - dragStateRef.current.y;
      dragStateRef.current.x = e.clientX;
      dragStateRef.current.y = e.clientY;
      const state = useCosmosStore.getState();
      state.setPovOrientation(state.povYawDeg + dx * 0.25, state.povPitchDeg + dy * 0.18);
    };
    const onPointerUp = () => {
      dragStateRef.current.active = false;
    };
    const onWheel = (e: WheelEvent) => {
      const state = useCosmosStore.getState();
      if (e.deltaY < 0) {
        state.setPovFovZoom(state.povFovZoom === 1 ? 2 : 4);
      } else if (e.deltaY > 0) {
        state.setPovFovZoom(state.povFovZoom === 4 ? 2 : 1);
      }
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  return (
    <group>
      <ambientLight intensity={isOrbital ? 0.65 : 0.72} />
      <directionalLight
        position={[14, 18, 8]}
        intensity={bodyId === 'mars' ? 2.2 : 1.95}
        color={bodyId === 'mars' ? '#fff0de' : '#ffffff'}
      />
      <directionalLight position={[-10, 6, -12]} intensity={0.45} color="#7dd3fc" />

      <DeepSpaceStarfield />

      {/* Warm butterscotch atmospheric skydome for Martian surface POV */}
      {!isOrbital && bodyId === 'mars' && (
        <mesh>
          <sphereGeometry args={[48, 32, 24]} />
          <meshBasicMaterial
            color={povSensorMode === 'NAVCAM_MONO' ? '#475569' : '#c97a53'}
            side={THREE.BackSide}
            transparent
            opacity={0.78}
          />
        </mesh>
      )}

      {isOrbital ? (
        <OrbitalCupolaBody bodyId={bodyId} sensorMode={povSensorMode} />
      ) : (
        /* Shift terrain vertically so the sample point directly underneath (0,0) rests at y=0 */
        <group position={[0, -groundY, 0]}>
          <MarsTerrainPatch
            bodyId={bodyId}
            locationKey={locationKey}
            footprintWidth={28}
            heightScale={1.15}
            sensorMode={povSensorMode}
            onSurfaceReady={handleSurfaceReady}
          />
        </group>
      )}

      <OnboardHardwareFrame kind={cockpitKind} />
    </group>
  );
}
