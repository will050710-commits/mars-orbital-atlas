import type React from 'react';
import type * as THREE from 'three';
import { BODY_CATALOG } from '../config/bodyCatalog';
import { DEVICE_CATALOG } from '../config/deviceCatalog';
import { useCosmosStore } from '../store/useCosmosStore';
import { DeepSpaceStarfield } from './environment/DeepSpaceStarfield';
import { SunLightSource } from './environment/SunLightSource';
import { MarsPlanetGroup } from './mars/MarsPlanetGroup';
import { PlanetaryOrbitContext } from './mars/PlanetaryOrbitContext';
import { ControlRoomFirstPersonScene } from './spacecraft/ControlRoomFirstPersonScene';
import { DeviceModel } from './spacecraft/DeviceModel';
import { OrbitalFleet } from './spacecraft/OrbitalFleet';
import { ProceduralDeviceModel } from './spacecraft/ProceduralDeviceModel';
import { MarsTerrainPatch } from './surface/MarsTerrainPatch';

export function CosmosSceneRoot({
  sunLightRef,
}: {
  sunLightRef: React.RefObject<THREE.DirectionalLight | null>;
}) {
  const bodyId = useCosmosStore((state) => state.activeBodyId);
  const deviceId = useCosmosStore((state) => state.activeDeviceId);
  const activeTarget = useCosmosStore((state) => state.activeTarget);
  const viewStage = useCosmosStore((state) => state.viewStage);
  const inspectionMode = useCosmosStore((state) => state.inspectionMode);
  const spectralMode = useCosmosStore((state) => state.spectralMode);

  const device = DEVICE_CATALOG.find((item) => item.id === deviceId);
  const hasPovSelection = Boolean(device) || Boolean(activeTarget);
  const isControlRoomPov = inspectionMode === 'CONTROL_ROOM_POV' && hasPovSelection;
  const isAvailableDevice = device?.status === 'available';
  const isProceduralDevice =
    device?.status === 'unavailable' && viewStage === 'SUB_SCENE';
  const isTerrainShowcase =
    spectralMode === 'TERRAIN_MESH_3D' &&
    !device &&
    (!activeTarget || activeTarget.category === 'SURFACE_POI');

  if (isControlRoomPov) {
    return <ControlRoomFirstPersonScene />;
  }

  if (isAvailableDevice && device) {
    return (
      <group>
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 5, 4]} intensity={1.85} />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} />
        <DeviceModel key={device.id} device={device} />
      </group>
    );
  }

  if (isProceduralDevice && device) {
    return (
      <group>
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 5, 4]} intensity={1.85} />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} />
        <ProceduralDeviceModel
          key={device.id}
          kind={device.proceduralModel ?? 'mars_rover_rtg'}
          name={device.name}
        />
      </group>
    );
  }

  if (isTerrainShowcase) {
    return (
      <group>
        <ambientLight intensity={0.75} />
        <directionalLight position={[10, 14, 8]} intensity={2.1} color="#fff2e2" />
        <directionalLight position={[-8, 4, -8]} intensity={0.55} color="#7dd3fc" />
        <DeepSpaceStarfield />
        <MarsTerrainPatch
          key={`${bodyId}-${activeTarget?.id ?? 'surface'}`}
          bodyId={bodyId}
          locationKey={activeTarget?.id ?? bodyId}
          footprintWidth={14}
          heightScale={1.0}
          spectralMode="TERRAIN_MESH_3D"
        />
      </group>
    );
  }

  return (
    <group>
      <SunLightSource sunLightRef={sunLightRef} />
      <DeepSpaceStarfield />
      <PlanetaryOrbitContext body={BODY_CATALOG[bodyId]} />
      <MarsPlanetGroup key={bodyId} body={BODY_CATALOG[bodyId]} />
      <OrbitalFleet />
    </group>
  );
}
