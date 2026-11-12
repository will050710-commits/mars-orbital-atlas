import { MarsCanvas } from './core/canvas/MarsCanvas';
import { CesiumMarsBridge } from './scene/surface/CesiumMarsBridge';
import { ImmersivePreloader } from './ui/preloader/ImmersivePreloader';
import { TopNavigationBar } from './ui/hud/TopNavigationBar';
import { CelestialQuickSelect } from './ui/hud/CelestialQuickSelect';
import { SubSceneInfoPanel } from './ui/hud/SubSceneInfoPanel';
import { TimeScrubberBar } from './ui/hud/TimeScrubberBar';

function App() {
  return (
    <div className="cosmos-app-root">
      {/* Lớp 1 & 4: Không gian Vũ trụ 3D (Three.js + R3F + SelectiveBloom + 4-Tier LOD) */}
      <MarsCanvas />

      {/* Lớp 4: Cầu nối Địa hình Bề mặt Sao Hỏa (CesiumJS 3D Tiles / Mars Ellipsoid) */}
      <CesiumMarsBridge />

      {/* Lớp UX 2D: Màn hình chờ Buồng lái & Hệ thống Điều khiển Telemetry HUD */}
      <ImmersivePreloader />
      <TopNavigationBar />
      <CelestialQuickSelect />
      <SubSceneInfoPanel />
      <TimeScrubberBar />
    </div>
  );
}

export default App;
