import React from 'react';
import { useCosmosStore, type SpectralMode } from '../../store/useCosmosStore';
import { spatialAudio } from '../../core/audio/SpatialAudioEngine';

const SPECTRAL_MODES: { id: SpectralMode; label: string; badge: string }[] = [
  { id: 'VISUAL_RGB', label: 'Quang học (Optical RGB)', badge: 'RGB' },
  { id: 'THERMAL_IR', label: 'Hồng ngoại (Thermal IR)', badge: 'THEMIS IR' },
  { id: 'MOLA_ELEVATION', label: 'Độ cao (MOLA Elevation)', badge: 'MOLA TOPO' },
];

const STAGE_LABELS: Record<string, string> = {
  PRELOADING: 'KHỞI TẠO BUỒNG LÁI',
  LAUNCHING: 'ĐANG NHẢY ALPHA VÀO QUỸ ĐẠO',
  ORBITAL_OVERVIEW: 'TOÀN CẢNH QUỸ ĐẠO TỰ DO',
  WARPING: 'ĐANG BAY CHUYỂN CẢNH (WARP TRANSIT)',
  SUB_SCENE: 'QUAN SÁT CẬN CẢNH MỤC TIÊU',
  SURFACE_CESIUM: 'ĐỊA HÌNH BỀ MẶT CESIUM 3D',
};

export const TopNavigationBar: React.FC = () => {
  const viewStage = useCosmosStore((state) => state.viewStage);
  const spectralMode = useCosmosStore((state) => state.spectralMode);
  const setSpectralMode = useCosmosStore((state) => state.setSpectralMode);
  const audioMuted = useCosmosStore((state) => state.audioMuted);
  const toggleAudio = useCosmosStore((state) => state.toggleAudio);
  const cameraAltitudeKm = useCosmosStore((state) => state.cameraAltitudeKm);

  if (viewStage === 'PRELOADING' || viewStage === 'LAUNCHING') return null;

  const handleToggleAudio = () => {
    const nextMuted = !audioMuted;
    spatialAudio.initAndStart();
    spatialAudio.setMuted(nextMuted);
    toggleAudio();
  };

  return (
    <header className="hud-top-bar glass-panel">
      <div className="hud-brand-block">
        <div className="hud-brand-dot" />
        <div>
          <div className="hud-brand-eyebrow">MARS ORBITAL ATLAS • DEEP SPACE TELEMETRY</div>
          <div className="hud-brand-title">HỆ THỐNG QUỸ ĐẠO &amp; BỀ MẶT SAO HỎA</div>
        </div>
      </div>

      <div className="hud-telemetry-readout">
        <div className="telemetry-metric">
          <span className="metric-label">TRẠNG THÁI</span>
          <span className="metric-value status-accent">{STAGE_LABELS[viewStage] ?? viewStage}</span>
        </div>
        <div className="telemetry-metric">
          <span className="metric-label">ĐỘ CAO CAMERA</span>
          <span className="metric-value">{cameraAltitudeKm.toLocaleString('vi-VN')} km</span>
        </div>
      </div>

      <div className="hud-controls-group" role="group" aria-label="Chế độ quang phổ và âm thanh">
        <div className="spectral-Pill-group">
          {SPECTRAL_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSpectralMode(mode.id)}
              className={`spectral-btn ${spectralMode === mode.id ? 'is-active' : ''}`}
              title={mode.label}
            >
              <span className="spectral-badge">{mode.badge}</span>
              <span className="spectral-text">{mode.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleToggleAudio}
          className={`audio-toggle-btn ${!audioMuted ? 'is-active' : ''}`}
        >
          {audioMuted ? '🔇 Âm thanh: TẮT' : '🔊 Âm thanh: BẬT'}
        </button>
      </div>
    </header>
  );
};
