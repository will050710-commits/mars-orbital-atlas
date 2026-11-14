import { BODY_CATALOG } from '../../config/bodyCatalog';
import { LINKED_ORBITAL_DEVICE_IDS } from '../../config/celestialCatalog';
import { DEVICE_CATALOG } from '../../config/deviceCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';
import type {
  DevicePartGroupId,
  SensorFilterMode,
  SourceReference,
} from '../../types/cosmos.types';
import { DeviceControlPanel } from './DeviceControlPanel';
import { DeviceDossierPanel } from './DeviceDossierPanel';

const PROCEDURAL_PART_GROUPS: Array<{ id: DevicePartGroupId; label: string }> = [
  { id: 'all', label: 'Toàn bộ' },
  { id: 'optics_mast', label: 'Cột quang học / Camera' },
  { id: 'mobility_chassis', label: 'Khung & Bánh xe' },
  { id: 'power_thermal', label: 'Nguồn RTG / Pin & Nhiệt' },
  { id: 'payload_science', label: 'Tay máy & Khoa học' },
];

const SENSOR_OPTIONS: Array<{ id: SensorFilterMode; label: string }> = [
  { id: 'OPTICAL_RGB', label: 'Quang học (WebP/Màu)' },
  { id: 'NAVCAM_MONO', label: 'Navcam Đen trắng' },
  { id: 'ELEVATION_GRID', label: 'Lưới Độ cao 3D' },
  { id: 'THERMAL_FALSE', label: 'Hồng ngoại Nhiệt' },
];

function Source({ source }: { source: SourceReference }) {
  return (
    <div className="source-note">
      <a href={source.url} target="_blank" rel="noreferrer">
        {source.title}
      </a>
      <small>
        Phiên bản: {source.version} · Kiểm tra: {source.checked}
      </small>
    </div>
  );
}

export function SubSceneInfoPanel() {
  const bodyId = useCosmosStore((state) => state.activeBodyId);
  const target = useCosmosStore((state) => state.activeTarget) ?? BODY_CATALOG[bodyId].target;
  const rawTarget = useCosmosStore((state) => state.activeTarget);
  const deviceId = useCosmosStore((state) => state.activeDeviceId);
  const load = useCosmosStore((state) => state.assetLoad);
  const retry = useCosmosStore((state) => state.retryAsset);
  const returnToOrbit = useCosmosStore((state) => state.returnToOrbit);
  const selectDevice = useCosmosStore((state) => state.selectDevice);

  const viewStage = useCosmosStore((state) => state.viewStage);
  const spectralMode = useCosmosStore((state) => state.spectralMode);
  const inspectionMode = useCosmosStore((state) => state.inspectionMode);
  const activePartGroupId = useCosmosStore((state) => state.activePartGroupId);
  const rotorSpinMode = useCosmosStore((state) => state.rotorSpinMode);

  const povYawDeg = useCosmosStore((state) => state.povYawDeg);
  const povPitchDeg = useCosmosStore((state) => state.povPitchDeg);
  const povFovZoom = useCosmosStore((state) => state.povFovZoom);
  const povSensorMode = useCosmosStore((state) => state.povSensorMode);
  const povArmDeployed = useCosmosStore((state) => state.povArmDeployed);
  const povScanActive = useCosmosStore((state) => state.povScanActive);

  const setViewStage = useCosmosStore((state) => state.setViewStage);
  const setSpectralMode = useCosmosStore((state) => state.setSpectralMode);
  const setInspectionMode = useCosmosStore((state) => state.setInspectionMode);
  const setOrbitalCloseup = useCosmosStore((state) => state.setOrbitalCloseup);
  const setActivePartGroup = useCosmosStore((state) => state.setActivePartGroup);
  const setRotorSpinMode = useCosmosStore((state) => state.setRotorSpinMode);
  const setPovOrientation = useCosmosStore((state) => state.setPovOrientation);
  const setPovFovZoom = useCosmosStore((state) => state.setPovFovZoom);
  const setPovSensorMode = useCosmosStore((state) => state.setPovSensorMode);
  const togglePovArm = useCosmosStore((state) => state.togglePovArm);
  const togglePovScan = useCosmosStore((state) => state.togglePovScan);
  const resetPovCamera = useCosmosStore((state) => state.resetPovCamera);
  const orbitalCloseup = useCosmosStore((state) => state.orbitalCloseup);

  const device = DEVICE_CATALOG.find((item) => item.id === deviceId);
  const isNonPlanetTarget = Boolean(rawTarget && rawTarget.id !== bodyId);
  const showDualModeSwitcher = Boolean(device) || isNonPlanetTarget;
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

  const handleSelectOption1 = () => {
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

  const handleSelectOption2 = () => {
    setInspectionMode('CONTROL_ROOM_POV');
  };

  return (
    <aside className="hud-right-panel glass-panel" aria-label="Thông tin và nguồn">
      <h2 className="info-panel-title">{device?.name ?? target.name}</h2>

      {showDualModeSwitcher && (
        <div
          className="dual-mode-switcher"
          data-testid="dual-view-mode-switcher"
          role="group"
          aria-label="Chế độ quan sát"
        >
          <button
            type="button"
            className="dual-mode-btn"
            data-testid="view-mode-closeup"
            aria-pressed={isCloseupPressed}
            onClick={handleSelectOption1}
          >
            <strong>Lựa chọn 1</strong>
            <span>
              {rawTarget?.category === 'SURFACE_POI'
                ? 'Soi địa hình 3D'
                : 'Quan sát mô hình 3D'}
            </span>
          </button>

          <button
            type="button"
            className="dual-mode-btn"
            data-testid="view-mode-pov"
            aria-pressed={inspectionMode === 'CONTROL_ROOM_POV'}
            onClick={handleSelectOption2}
          >
            <strong>Lựa chọn 2</strong>
            <span>Buồng điều khiển / Góc nhìn thứ nhất</span>
          </button>
        </div>
      )}

      {showDualModeSwitcher && inspectionMode === 'CONTROL_ROOM_POV' && (
        <section
          className="pov-control-deck"
          data-testid="pov-control-deck"
          aria-label="Điều khiển buồng lái / góc nhìn thứ nhất"
        >
          <div className="device-control-header">
            <span className="dock-section-title">BUỒNG ĐIỀU KHIỂN · GÓC NHÌN THỨ NHẤT</span>
            <span className="control-pill-badge">Mô phỏng trực quan</span>
          </div>
          <p className="control-disclaimer">
            Góc nhìn thứ nhất minh họa trên {bodyId === 'mars' ? 'mảnh địa hình 3D baked 8K' : 'địa hình hố va chạm giả lập'}. Không phải ảnh chụp thời gian thực từ sứ mệnh.
          </p>

          <div className="control-section">
            <span className="control-section-label">
              Hướng nhìn (Yaw {Math.round(povYawDeg)}° · Pitch {Math.round(povPitchDeg)}°)
            </span>
            <div className="control-chip-grid">
              <button
                type="button"
                className="control-chip-btn"
                data-testid="pov-yaw-left"
                onClick={() => setPovOrientation(povYawDeg - 15, povPitchDeg)}
              >
                ← Quay trái 15°
              </button>
              <button
                type="button"
                className="control-chip-btn"
                data-testid="pov-yaw-right"
                onClick={() => setPovOrientation(povYawDeg + 15, povPitchDeg)}
              >
                Quay phải 15° →
              </button>
              <button
                type="button"
                className="control-chip-btn"
                data-testid="pov-pitch-up"
                onClick={() => setPovOrientation(povYawDeg, povPitchDeg + 8)}
              >
                ↑ Ngước lên 8°
              </button>
              <button
                type="button"
                className="control-chip-btn"
                data-testid="pov-pitch-down"
                onClick={() => setPovOrientation(povYawDeg, povPitchDeg - 8)}
              >
                ↓ Cúi xuống 8°
              </button>
            </div>
          </div>

          <div className="control-section">
            <span className="control-section-label">Thu phóng quang học</span>
            <div className="control-step-grid">
              {([1, 2, 4] as const).map((zoom) => (
                <button
                  key={zoom}
                  type="button"
                  className="control-step-btn"
                  data-testid={`pov-zoom-${zoom}`}
                  aria-pressed={povFovZoom === zoom}
                  onClick={() => setPovFovZoom(zoom)}
                >
                  {zoom}×
                </button>
              ))}
              <button
                type="button"
                className="control-step-btn"
                data-testid="pov-reset"
                onClick={resetPovCamera}
              >
                Đặt lại
              </button>
            </div>
          </div>

          <div className="control-section">
            <span className="control-section-label">Kênh cảm biến quan sát</span>
            <div className="control-chip-grid">
              {SENSOR_OPTIONS.map((sensor) => (
                <button
                  key={sensor.id}
                  type="button"
                  className="control-chip-btn"
                  data-testid={`pov-sensor-${sensor.id}`}
                  aria-pressed={povSensorMode === sensor.id}
                  onClick={() => setPovSensorMode(sensor.id)}
                >
                  {sensor.label}
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <span className="control-section-label">Onboard Instrument Actuation (Illustrative)</span>
            <div className="control-chip-grid">
              <button
                type="button"
                className="control-chip-btn"
                data-testid="pov-action-arm"
                aria-pressed={povArmDeployed}
                onClick={togglePovArm}
              >
                {povArmDeployed ? 'Stow Robotic Arm / Boom' : 'Deploy Robotic Arm / Boom'}
              </button>
              <button
                type="button"
                className="control-chip-btn"
                data-testid="pov-action-scan"
                aria-pressed={povScanActive}
                onClick={togglePovScan}
              >
                {povScanActive ? 'Stop Spectrometer Scan' : 'Trigger Spectrometer Scan'}
              </button>
            </div>
          </div>
        </section>
      )}

      {device ? (
        <>
          <p>{device.summary}</p>
          <div role="status" aria-live="polite" data-testid="model-status">
            {load.status === 'loading' &&
              'Đang tải / giải mã' + (load.progress === undefined ? '…' : ' · tệp ' + load.progress + '%')}
            {load.status === 'ready' && 'Đã tải mô hình'}
            {load.status === 'unavailable' && 'Chưa có mô hình 3D được xác minh'}
            {load.status === 'error' && (
              <>
                <p role="alert">
                  Không tải được {device.name}. {load.message}
                </p>
                <button className="hud-action-btn" onClick={retry}>
                  Thử lại
                </button>
              </>
            )}
          </div>

          {device.status === 'available' ? (
            <>
              <p className="coverage-note">
                Xem mô hình riêng, chuẩn hóa kích thước để quan sát. Tỉ lệ vật lý và vị trí triển khai chưa được xác minh. Kéo để xoay; cuộn để thu phóng.
              </p>
              {load.status === 'ready' && inspectionMode === 'MODEL_CLOSEUP' && (
                <DeviceControlPanel deviceId={device.id} />
              )}
              <p>
                <strong>Ghi công:</strong> {device.credit}
              </p>
              <p>
                {device.license.url ? (
                  <a href={device.license.url} target="_blank" rel="noreferrer">
                    {device.license.label}
                  </a>
                ) : (
                  device.license.label
                )}
              </p>
              <p className="source-note">
                Phiên bản model: {device.version}. Tệp gốc không chỉnh sửa; chỉ căn giữa và đổi tỉ lệ khi xem.
              </p>
            </>
          ) : (
            <>
              <p className="coverage-note">
                Hồ sơ thiết bị từ tài liệu cung cấp; không có tệp mô hình 3D NASA gốc nào được tải.
              </p>
              {Boolean(device.proceduralModel) && inspectionMode === 'MODEL_CLOSEUP' && (
                <section
                  className="device-control-panel"
                  data-testid="procedural-device-controls"
                  aria-label="Mô hình tái dựng minh họa"
                >
                  <div className="device-control-header">
                    <span className="dock-section-title">TÁI DỰNG 3D MINH HỌA</span>
                    <span className="control-pill-badge">Procedural 3D</span>
                  </div>
                  <p className="control-disclaimer">
                    Hình khối tái dựng nhằm minh họa bố cục cấu phần khi chưa có tệp NASA GLB chính thức.
                  </p>
                  <div className="control-chip-grid">
                    {PROCEDURAL_PART_GROUPS.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        className="control-chip-btn"
                        aria-pressed={activePartGroupId === group.id}
                        onClick={() => setActivePartGroup(group.id)}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="hud-action-btn control-spin-btn"
                    aria-pressed={rotorSpinMode === 'demo_slow'}
                    onClick={() =>
                      setRotorSpinMode(rotorSpinMode === 'demo_slow' ? 'stopped' : 'demo_slow')
                    }
                  >
                    {rotorSpinMode === 'demo_slow'
                      ? 'Dừng xoay trục minh họa'
                      : 'Xoay chậm cụm quang học (Minh họa)'}
                  </button>
                </section>
              )}
              <p>
                <strong>Ghi công:</strong> {device.credit}
              </p>
              <p>{device.license.label}</p>
              <p className="source-note">
                Phiên bản hồ sơ: {device.version}. Không có tệp gốc hoặc tỉ lệ hình học để xác minh.
              </p>
            </>
          )}

          <Source source={device.source} />
          <details>
            <summary>Nguồn cung cấp</summary>
            <p>{device.evidence}</p>
            {device.attributionPath && (
              <a href={device.attributionPath} target="_blank" rel="noreferrer">
                Tệp ghi công gốc
              </a>
            )}
          </details>
        </>
      ) : (
        <>
          <p className="info-panel-subtitle">{target.subtitle}</p>
          <p>{target.telemetry.missionSummary}</p>
          {target.coordinates && (
            <p className="coordinates-strip">
              Vĩ độ {target.coordinates.lat.toFixed(2)}° · Kinh độ {target.coordinates.lon.toFixed(2)}°Đ
            </p>
          )}
          {!target.coordinates && <p>Trọng lực: {target.telemetry.surfaceGravityMs2}</p>}
          <ul className="highlights-list">
            {target.telemetry.keyHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {spectralMode === 'TERRAIN_MESH_3D' && (
            <div className="control-facts-box" data-testid="terrain-mesh-banner">
              <small>
                {bodyId === 'moon'
                  ? 'Đang hiển thị khối địa hình 3D Mặt Trăng (`moon_terrain.glb` + bộ texture WebP baked 8K: Albedo, Normals, Roughness). Kéo để xoay quanh khối địa hình.'
                  : 'Đang hiển thị khối địa hình 3D Sao Hỏa (`mars_terrain.glb` + bộ texture WebP baked 8K: Albedo, Normals, Roughness). Kéo để xoay quanh khối địa hình.'}
              </small>
            </div>
          )}
          {target.source && <Source source={target.source} />}
          <p className="coverage-note">
            Chưa có ảnh / địa hình đo đạc định lượng theo độ phân giải thực. Các lớp địa hình và POV mang tính trực quan minh họa.
          </p>
        </>
      )}

      {(device?.id ?? rawTarget?.id) && (
        <DeviceDossierPanel
          key={device?.id ?? rawTarget?.id ?? 'none'}
          targetId={device?.id ?? rawTarget?.id}
        />
      )}

      <button className="hud-action-btn secondary-btn" onClick={returnToOrbit}>
        Trở về toàn cảnh
      </button>
    </aside>
  );
}
