import { MarsCanvas } from './core/canvas/MarsCanvas';
import { TopNavigationBar } from './ui/hud/TopNavigationBar';
import { CelestialQuickSelect } from './ui/hud/CelestialQuickSelect';
import { SubSceneInfoPanel } from './ui/hud/SubSceneInfoPanel';
import { TimeScrubberBar } from './ui/hud/TimeScrubberBar';
import { ControlRoomHudOverlay } from './ui/hud/ControlRoomHudOverlay';
import { validateCatalog, validateDeviceControlSpecs } from './config/validateCatalog';
import { BODY_CATALOG } from './config/bodyCatalog';
import { ATLAS_POIS } from './config/atlasPOIs';
import { DEVICE_CATALOG } from './config/deviceCatalog';
import { DEVICE_CONTROL_SPECS } from './config/deviceControlSpecs';

validateCatalog(Object.values(BODY_CATALOG), ATLAS_POIS, DEVICE_CATALOG);
validateDeviceControlSpecs(DEVICE_CATALOG, DEVICE_CONTROL_SPECS);

function App() {
  return (
    <div className="cosmos-app-root atlas-release">
      <MarsCanvas />
      <ControlRoomHudOverlay />
      <TopNavigationBar />
      <CelestialQuickSelect />
      <SubSceneInfoPanel />
      <TimeScrubberBar />
    </div>
  );
}
export default App;
