import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { BODY_CATALOG } from '../../config/bodyCatalog';
import { DEVICE_CATALOG } from '../../config/deviceCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';

// Camera bounds are now body-relative and stay below the old floating-origin threshold.
// Keep the existing scene wrapper; no recentering that would desynchronize OrbitControls.
export function FloatingOriginManager({ children }: { children: ReactNode }) {
  useFrame(({ camera }) => {
    const state = useCosmosStore.getState();
    const inspection = DEVICE_CATALOG.some((device) => device.id === state.activeDeviceId && device.status === 'available');
    if (inspection) return;
    const altitude = Math.max(0, Math.round(camera.position.length() - BODY_CATALOG[state.activeBodyId].radiusKm));
    if (Math.abs(altitude - state.cameraAltitudeKm) >= 5) state.setCameraAltitudeKm(altitude);
  });
  return <group>{children}</group>;
}
