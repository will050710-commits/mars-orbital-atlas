import React from 'react';
import { LINKED_ORBITAL_DEVICE_IDS } from '../../config/celestialCatalog';
import { DEVICE_CATALOG } from '../../config/deviceCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';

/**
 * Prominent floating top-center view-mode selector whenever a device, moon, orbiter,
 * or surface destination is focused, exposing Option 1 (3D Close-Up) and Option 2 (Control Room POV).
 */
export const ViewModeFloatingBar: React.FC = () => {
  const bodyId = useCosmosStore((state) => state.activeBodyId);
  const deviceId = useCosmosStore((state) => state.activeDeviceId);
  const rawTarget = useCosmosStore((state) => state.activeTarget);
  const viewStage = useCosmosStore((state) => state.viewStage);
  const spectralMode = useCosmosStore((state) => state.spectralMode);
  const inspectionMode = useCosmosStore((state) => state.inspectionMode);
  const orbitalCloseup = useCosmosStore((state) => state.orbitalCloseup);

  const selectDevice = useCosmosStore((state) => state.selectDevice);
  const setInspectionMode = useCosmosStore((state) => state.setInspectionMode);
  const setOrbitalCloseup = useCosmosStore((state) => state.setOrbitalCloseup);
  const setSpectralMode = useCosmosStore((state) => state.setSpectralMode);
  const setViewStage = useCosmosStore((state) => state.setViewStage);
  const returnToOrbit = useCosmosStore((state) => state.returnToOrbit);

  if (viewStage === 'PRELOADING' || viewStage === 'LAUNCHING') return null;

  const device = DEVICE_CATALOG.find((item) => item.id === deviceId);
  const isNonPlanetTarget = Boolean(rawTarget && rawTarget.id !== bodyId);
  if (!device && !isNonPlanetTarget) return null;

  const linkedOrbitalDeviceId = rawTarget ? LINKED_ORBITAL_DEVICE_IDS[rawTarget.id] : undefined;
  const isOrbitalTargetWithoutDevice = Boolean(
    rawTarget &&
      !linkedOrbitalDeviceId &&
      (rawTarget.category === 'MOON' || rawTarget.category === 'SPACECRAFT'),
  );
  const isCloseupPressed =
    inspectionMode === 'MODEL_CLOSEUP' &&
    (!device ||
      device.status === 'available' ||
      Boolean(device.proceduralModel) ||
      viewStage === 'SUB_SCENE') &&
    (!rawTarget || rawTarget.category !== 'SURFACE_POI' || spectralMode === 'TERRAIN_MESH_3D') &&
    (!isOrbitalTargetWithoutDevice || orbitalCloseup);

  const handleOption1 = () => {
    if (device) {
      setInspectionMode('MODEL_CLOSEUP');
      if (device.status === 'unavailable' && !device.proceduralModel) {
        setViewStage('SUB_SCENE');
      }
      return;
    }
    if (rawTarget && linkedOrbitalDeviceId) {
      selectDevice(linkedOrbitalDeviceId);
      return;
    }
    if (rawTarget?.category === 'SURFACE_POI') {
      setOrbitalCloseup(false);
      setInspectionMode('MODEL_CLOSEUP');
      setSpectralMode('TERRAIN_MESH_3D');
      return;
    }
    if (rawTarget) {
      setOrbitalCloseup(true);
      setInspectionMode('MODEL_CLOSEUP');
      setViewStage('SUB_SCENE');
    }
  };

  const handleOption2 = () => {
    setInspectionMode('CONTROL_ROOM_POV');
  };

  return (
    <div
      className="floating-view-mode-bar glass-panel"
      data-testid="floating-view-mode-bar"
      role="group"
      aria-label="Observation mode selector"
    >
      <span className="floating-target-label">{device?.name ?? rawTarget?.name}</span>
      <button
        type="button"
        className="floating-mode-btn"
        data-testid="floating-mode-closeup"
        aria-pressed={isCloseupPressed}
        onClick={handleOption1}
      >
        {rawTarget?.category === 'SURFACE_POI'
          ? 'Option 1 · 3D Terrain Close-Up'
          : 'Option 1 · 3D Close-Up'}
      </button>
      <button
        type="button"
        className="floating-mode-btn"
        data-testid="floating-mode-pov"
        aria-pressed={inspectionMode === 'CONTROL_ROOM_POV'}
        onClick={handleOption2}
      >
        Option 2 · Control Room POV
      </button>
      <button
        type="button"
        className="floating-return-btn"
        data-testid="floating-mode-return"
        onClick={returnToOrbit}
        title="Return to Orbital Overview"
      >
        Overview
      </button>
    </div>
  );
};
