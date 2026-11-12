import React from 'react';
import { useCosmosStore } from '../../store/useCosmosStore';

export const SubSceneInfoPanel: React.FC = () => {
  const activeTarget = useCosmosStore((state) => state.activeTarget);
  const viewStage = useCosmosStore((state) => state.viewStage);
  const enterSurfaceLanding = useCosmosStore((state) => state.enterSurfaceLanding);
  const returnToOrbit = useCosmosStore((state) => state.returnToOrbit);

  if (!activeTarget || viewStage === 'PRELOADING') return null;

  const { telemetry, coordinates, isSurfaceLanding } = activeTarget;

  return (
    <aside className="hud-right-panel glass-panel" aria-labelledby="target-panel-title">
      <div className="info-panel-header">
        <span className="telemetry-tag">
          {viewStage === 'WARPING' ? 'ĐANG TIẾP CẬN MỤC TIÊU...' : telemetry.classification}
        </span>
        <h2 id="target-panel-title" className="info-panel-title">
          {activeTarget.name}
        </h2>
        <p className="info-panel-subtitle">{activeTarget.subtitle}</p>
      </div>

      <div className="telemetry-grid">
        <div className="telemetry-box">
          <span className="box-label">NHIỆT ĐỘ BỀ MẶT / MÔI TRƯỜNG</span>
          <strong className="box-value">{telemetry.meanTemperatureC}</strong>
        </div>
        <div className="telemetry-box">
          <span className="box-label">ÁP SUẤT KHÍ QUYỂN</span>
          <strong className="box-value">{telemetry.atmosphericPressurePa}</strong>
        </div>
        <div className="telemetry-box">
          <span className="box-label">GIA TỐC TRỌNG TRƯỜNG</span>
          <strong className="box-value">{telemetry.surfaceGravityMs2}</strong>
        </div>
        <div className="telemetry-box">
          <span className="box-label">VẬN TỐC QUỸ ĐẠO / QUAY</span>
          <strong className="box-value">{telemetry.orbitalVelocityKms}</strong>
        </div>
      </div>

      {coordinates && (
        <div className="coordinates-strip">
          <span>Vĩ độ: {coordinates.lat.toFixed(2)}°</span>
          <span>Kinh độ: {coordinates.lon.toFixed(2)}°</span>
          <span>
            Độ cao MOLA: {coordinates.elevationKm > 0 ? `+${coordinates.elevationKm}` : coordinates.elevationKm} km
          </span>
        </div>
      )}

      <div className="info-summary-block">
        <h3>Hồ Sơ Khoa Học &amp; Địa Chất ({telemetry.geologicalAge})</h3>
        <p>{telemetry.missionSummary}</p>
        <ul className="highlights-list">
          {telemetry.keyHighlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="info-panel-actions">
        {isSurfaceLanding && viewStage !== 'SURFACE_CESIUM' && (
          <button
            type="button"
            onClick={enterSurfaceLanding}
            className="hud-action-btn primary-landing-btn"
          >
            🛬 Hạ Cánh Bề Mặt (Cesium Mars 3D Tiles)
          </button>
        )}

        <button
          type="button"
          onClick={returnToOrbit}
          className="hud-action-btn secondary-btn"
        >
          ← Trở Về Toàn Cảnh Quỹ Đạo
        </button>
      </div>
    </aside>
  );
};
