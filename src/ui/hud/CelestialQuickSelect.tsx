import { BODY_CATALOG } from '../../config/bodyCatalog';
import { ATLAS_POIS } from '../../config/atlasPOIs';
import { getOrbitalActorsForBody } from '../../config/celestialCatalog';
import { DEVICE_CATALOG } from '../../config/deviceCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';
import type { SpectralMode } from '../../types/cosmos.types';

const MARS_LAYER_OPTIONS: Array<{
  mode: SpectralMode;
  label: string;
  tag: string;
}> = [
  { mode: 'VISUAL_RGB', label: 'Ảnh màu 8K (Baked)', tag: 'WebP 8K' },
  { mode: 'MOLA_ELEVATION', label: 'Độ cao (Minh họa)', tag: 'MOLA' },
  { mode: 'THERMAL_IR', label: 'Hồng ngoại (Minh họa)', tag: 'THEMIS' },
  { mode: 'TERRAIN_MESH_3D', label: 'Địa hình 3D (Mesh)', tag: 'GLB + 8K' },
];

export function CelestialQuickSelect() {
  const bodyId = useCosmosStore((state) => state.activeBodyId);
  const target = useCosmosStore((state) => state.activeTarget);
  const deviceId = useCosmosStore((state) => state.activeDeviceId);
  const spectralMode = useCosmosStore((state) => state.spectralMode);
  const showOrbits = useCosmosStore((state) => state.showOrbits);

  const selectBody = useCosmosStore((state) => state.selectBody);
  const selectTarget = useCosmosStore((state) => state.selectTarget);
  const selectDevice = useCosmosStore((state) => state.selectDevice);
  const setSpectralMode = useCosmosStore((state) => state.setSpectralMode);
  const toggleOrbits = useCosmosStore((state) => state.toggleOrbits);

  const body = BODY_CATALOG[bodyId];
  const pois = ATLAS_POIS.filter((poi) => poi.bodyId === bodyId);
  const orbitalActors = getOrbitalActorsForBody(bodyId);
  const devices = DEVICE_CATALOG.filter((device) => device.bodyId === bodyId);

  return (
    <aside className="hud-left-dock glass-panel" aria-label="Danh mục khám phá">
      <div className="dock-section-title">Thiên thể</div>
      <button
        type="button"
        className="target-list-btn"
        aria-pressed={!target && !deviceId && spectralMode !== 'TERRAIN_MESH_3D'}
        onClick={() => selectBody(bodyId)}
      >
        <span className="target-btn-name">{body.name}</span>
        <span className="target-btn-sub">Toàn cảnh quỹ đạo</span>
      </button>

      <div className="dock-section-title">Quỹ đạo &amp; Vệ tinh</div>
      <button
        type="button"
        className="target-list-btn"
        data-testid="toggle-orbits-btn"
        aria-pressed={showOrbits}
        onClick={toggleOrbits}
      >
        <span className="target-btn-name">Quỹ đạo hành tinh &amp; Vệ tinh</span>
        <span className="target-btn-sub">{showOrbits ? 'Đang bật quỹ đạo' : 'Đang ẩn quỹ đạo'}</span>
      </button>
      {orbitalActors.map((actor) => (
        <button
          key={actor.id}
          type="button"
          className="target-list-btn"
          data-testid={`orbital-actor-${actor.id}`}
          aria-pressed={target?.id === actor.id}
          onClick={() => selectTarget(actor)}
        >
          <span className="target-btn-name">{actor.name}</span>
          <span className="target-btn-sub">
            {actor.category === 'MOON' ? 'Vệ tinh tự nhiên' : 'Tàu quỹ đạo'}
          </span>
        </button>
      ))}

      <div className="dock-section-title">Địa danh</div>
      {pois.map((poi) => (
        <button
          key={poi.id}
          type="button"
          className="target-list-btn"
          aria-pressed={target?.id === poi.id}
          onClick={() => selectTarget(poi)}
        >
          <span className="target-btn-name">{poi.name}</span>
          <span className="target-btn-sub">Tâm địa danh</span>
        </button>
      ))}

      <div className="dock-section-title">Thiết bị trong tài liệu</div>
      {devices.map((device) => (
        <button
          key={device.id}
          type="button"
          className="target-list-btn"
          aria-pressed={deviceId === device.id}
          onClick={() => selectDevice(device.id)}
        >
          <span className="target-btn-name">{device.name}</span>
          <span className="target-btn-sub">
            {device.status === 'available' ? 'Xem mô hình 3D' : 'Chưa có mô hình 3D'}
          </span>
        </button>
      ))}

      <div className="dock-section-title">Lớp dữ liệu</div>
      {bodyId === 'mars' ? (
        MARS_LAYER_OPTIONS.map((layer) => (
          <button
            key={layer.mode}
            type="button"
            className="target-list-btn"
            data-testid={`layer-btn-${layer.mode}`}
            aria-pressed={spectralMode === layer.mode}
            onClick={() => setSpectralMode(layer.mode)}
          >
            <span className="target-btn-name">{layer.label}</span>
            <span className="target-btn-sub">{layer.tag}</span>
          </button>
        ))
      ) : (
        body.layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            className="target-list-btn"
            disabled={layer.status === 'unavailable'}
            title={layer.detail}
          >
            <span className="target-btn-name">{layer.label}</span>
            <span className="target-btn-sub">{layer.status}</span>
          </button>
        ))
      )}
    </aside>
  );
}
