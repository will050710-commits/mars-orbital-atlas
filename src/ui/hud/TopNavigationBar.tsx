import { BODY_CATALOG } from '../../config/bodyCatalog';
import { DEVICE_CATALOG } from '../../config/deviceCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';
import { spatialAudio } from '../../core/audio/SpatialAudioEngine';

export function TopNavigationBar() {
  const bodyId = useCosmosStore((state) => state.activeBodyId);
  const deviceId = useCosmosStore((state) => state.activeDeviceId);
  const selectBody = useCosmosStore((state) => state.selectBody);
  const muted = useCosmosStore((state) => state.audioMuted);
  const toggleAudio = useCosmosStore((state) => state.toggleAudio);
  const device = DEVICE_CATALOG.find((item) => item.id === deviceId);
  const subtitle = device
    ? (device.status === 'available' ? 'Thư viện thiết bị · mô hình minh họa' : 'Hồ sơ thiết bị · chưa có mô hình 3D')
    : 'Globe minh họa · chưa có ảnh / địa hình đo đạc';
  return <header className="hud-top-bar glass-panel">
    <div className="hud-brand-block"><div className="hud-brand-dot" /><div>
      <div className="hud-brand-eyebrow">ATLAS 3D · KHÁM PHÁ KHÔNG GIAN</div>
      <h1 className="hud-brand-title">{BODY_CATALOG[bodyId].name}</h1>
      <small>{subtitle}</small>
    </div></div>
    <nav aria-label="Chọn thiên thể" className="body-selector">
      {Object.values(BODY_CATALOG).map((body) => <button key={body.id}
        aria-pressed={body.id === bodyId} className={'hud-action-btn ' + (body.id === bodyId ? 'is-active' : '')}
        onClick={() => selectBody(body.id)}>{body.name}</button>)}
    </nav>
    <button className="audio-toggle-btn" onClick={() => {
      spatialAudio.setMuted(!muted); spatialAudio.initAndStart(); toggleAudio();
    }}>{muted ? 'Bật âm thanh' : 'Tắt âm thanh'}</button>
  </header>;
}
