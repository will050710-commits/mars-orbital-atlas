import { useCosmosStore } from '../../store/useCosmosStore';
import { DEVICE_CATALOG } from '../../config/deviceCatalog';
import type { SensorFilterMode } from '../../types/cosmos.types';

const SENSOR_LABELS: Record<SensorFilterMode, string> = {
  OPTICAL_RGB: 'OPTICAL 8K / TRUE COLOR',
  NAVCAM_MONO: 'NAVCAM MONO STEREO',
  ELEVATION_GRID: 'ELEVATION CONTOUR GRID',
  THERMAL_FALSE: 'THERMAL IR FALSE-COLOR',
};

/**
 * Lightweight, non-blocking HUD crosshair & telemetry reticle overlay shown only when
 * Option 2 (`CONTROL_ROOM_POV`) is active for a device or destination.
 */
export function ControlRoomHudOverlay() {
  const inspectionMode = useCosmosStore((state) => state.inspectionMode);
  const activeDeviceId = useCosmosStore((state) => state.activeDeviceId);
  const activeTarget = useCosmosStore((state) => state.activeTarget);
  const povYawDeg = useCosmosStore((state) => state.povYawDeg);
  const povPitchDeg = useCosmosStore((state) => state.povPitchDeg);
  const povFovZoom = useCosmosStore((state) => state.povFovZoom);
  const povSensorMode = useCosmosStore((state) => state.povSensorMode);

  if (inspectionMode !== 'CONTROL_ROOM_POV' || (!activeDeviceId && !activeTarget)) {
    return null;
  }

  const device = DEVICE_CATALOG.find((item) => item.id === activeDeviceId);
  const platformName = device?.name ?? activeTarget?.name ?? 'Control Station';
  const headingDeg = ((Math.round(povYawDeg) % 360) + 360) % 360;

  return (
    <div
      className="control-room-hud-overlay"
      data-testid="control-room-hud"
      aria-hidden="true"
    >
      <div className="pov-top-telemetry">
        <span className="pov-pill">POV · {platformName}</span>
        <span className="pov-pill">HDG {String(headingDeg).padStart(3, '0')}°</span>
        <span className="pov-pill">
          PITCH {povPitchDeg >= 0 ? `+${Math.round(povPitchDeg)}` : Math.round(povPitchDeg)}°
        </span>
        <span className="pov-pill">ZOOM {povFovZoom}×</span>
        <span className="pov-pill is-sensor">{SENSOR_LABELS[povSensorMode]}</span>
      </div>

      <div className="pov-reticle-center">
        <span className="pov-reticle-ring" />
        <span className="pov-reticle-cross-h" />
        <span className="pov-reticle-cross-v" />
      </div>

      <div className="pov-bottom-hint">
        <span>Kéo chuột trên màn hình để xoay · Cuộn để zoom · Góc nhìn mô phỏng trực quan</span>
      </div>
    </div>
  );
}
