import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, type Group } from 'three';
import { ATLAS_POIS, latLonToBodyVector } from '../../config/atlasPOIs';
import { MARS_AXIAL_TILT_RAD, MOON_AXIAL_TILT_RAD } from '../../config/celestialCatalog';
import { DEVICE_CATALOG } from '../../config/deviceCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';
import type { BodyConfig } from '../../types/cosmos.types';
import { PhobosOrbit } from '../moons/PhobosOrbit';
import { DeimosOrbit } from '../moons/DeimosOrbit';
import { MarsAtmosphereMesh } from './MarsAtmosphereMesh';
import { MarsLODMesh } from './MarsLODMesh';
import { POIMarker3D } from './POIMarker3D';

export function MarsPlanetGroup({ body }: { body: BodyConfig }) {
  const spinGroupRef = useRef<Group>(null);
  const planetCenter = useMemo(() => new Vector3(0, 0, 0), []);
  const showPOIs = useCosmosStore((state) => state.showPOIs);
  const showOrbits = useCosmosStore((state) => state.showOrbits);
  const activeDeviceId = useCosmosStore((state) => state.activeDeviceId);
  const controlsLocked = useCosmosStore((state) => state.controlsLocked);
  const selectDevice = useCosmosStore((state) => state.selectDevice);

  const tiltRad = body.id === 'mars' ? MARS_AXIAL_TILT_RAD : MOON_AXIAL_TILT_RAD;
  const pois = useMemo(
    () => ATLAS_POIS.filter((poi) => poi.bodyId === body.id),
    [body.id],
  );
  const surfaceDevices = useMemo(
    () =>
      DEVICE_CATALOG.filter(
        (device) => device.bodyId === body.id && Boolean(device.coordinates),
      ).map((device) => ({
        device,
        localPos: latLonToBodyVector(
          device.coordinates!.lat,
          device.coordinates!.lon,
          body.radiusKm + 14,
        ),
      })),
    [body.id, body.radiusKm],
  );

  useFrame(() => {
    if (!spinGroupRef.current) return;
    spinGroupRef.current.rotation.y =
      (useCosmosStore.getState().simulationTime / body.rotationSeconds) * Math.PI * 2;
  });

  return (
    <group rotation={[0, 0, tiltRad]}>
      <group ref={spinGroupRef}>
        <MarsLODMesh body={body} />
        {showPOIs &&
          pois.map((poi) => (
            <POIMarker3D key={poi.id} target={poi} planetCenter={planetCenter} />
          ))}
        {showPOIs &&
          surfaceDevices.map(({ device, localPos }) => {
            const isSelected = activeDeviceId === device.id;
            const beaconRadius = Math.max(18, body.radiusKm * 0.008);
            return (
              <mesh
                key={device.id}
                position={localPos}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!controlsLocked) selectDevice(device.id);
                }}
                onPointerOver={() => {
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'default';
                }}
              >
                <octahedronGeometry args={[isSelected ? beaconRadius * 1.45 : beaconRadius, 0]} />
                <meshStandardMaterial
                  color={device.status === 'available' ? '#38bdf8' : '#f59e0b'}
                  emissive={device.status === 'available' ? '#38bdf8' : '#f59e0b'}
                  emissiveIntensity={isSelected ? 1.8 : 0.85}
                />
              </mesh>
            );
          })}
      </group>

      {body.id === 'mars' && <MarsAtmosphereMesh />}
      {body.id === 'mars' && showOrbits && (
        <>
          <PhobosOrbit />
          <DeimosOrbit />
        </>
      )}
    </group>
  );
}
