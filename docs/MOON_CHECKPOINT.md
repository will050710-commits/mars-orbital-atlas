# Moon checkpoint — 2026-11-14

Status: **passed**. Mars and Moon share one application and one scene; no separate Moon app or duplicated scene was created.

## Scope verified

- The Moon is a first-class body in the shared catalog with mean radius 1737.4 km, sidereal rotation 655.720 hours and catalog gravity 1.62 m/s² from the NASA NSSDCA Moon Fact Sheet. The globe rotation is illustrative elapsed time, not an ephemeris.
- The Moon globe uses a deterministic procedural gray albedo texture. It is not measured lunar imagery and contains no elevation data. Imagery, terrain/elevation and thermal layers are explicitly labeled unavailable in the UI and catalog.
- Three Moon POIs are present:
  - Mare Tranquillitatis, IAU/USGS feature 3691, 8.35°, 30.83°E.
  - Tycho, IAU/USGS feature 6163, -43.30°, 348.78°E (Gazetteer -11.22°).
  - South Pole–Aitken, NASA orthographic view center 53°S, 191°E. The UI states this is a view center and not an IAU-defined feature center or landing site.
- Six Apollo equipment records exist as `unavailable`: Lunar Roving Vehicle (LRV), LRV deployment mechanism & chassis, LRV Apollo 15, LRV Apollo 17, Apollo surface equipment, and Lunar Module MESA & attached equipment. None has a model path, bytes, SHA-256, model license URL or attribution file.
- The supplied Apollo equipment CSV is preserved byte-for-byte at `public/assets/provenance/apollo-equipment.csv`; SHA-256 `792d700306da6348e989c5a1d6737f058be2b03e8fda255b7e0871095b6ce59a` matches the supplied file.
- `scripts/import-mars-assets.py` regenerates both Mars assets and Moon records. The manifest has 13 records: 7 Mars (5 available, 2 unavailable) and 6 Moon (all unavailable).
- Body switching Mars → Moon → Mars resets active target/device/load state and keeps both globes usable. A failed Mars model does not block Moon navigation or records, and Mars remains retryable after switching back.
- The Moon browser flow makes no `.glb` requests. Selecting any Apollo record keeps the overview active and never installs a model loader.
- Device-model geometries, materials and textures are disposed through the tested shared disposal path. Procedural globe textures are owned by the shared mesh effect and disposed in its cleanup when the body style changes; the switching flow was exercised in the browser, but WebGL memory was not sampled per body.
- Switching from an active `Ingenuity` control session (`rte_horizon`, highlighted `cams`, spinning rotors) to the Moon clears the device control panel, leaves Moon Apollo records unloadable with zero `.glb` requests, and resets `Ingenuity` control state (`overview`, `all`, `0°`, `stopped`) when returning to Mars.
- Narrow-viewport Moon flow (390×844) keeps the canvas, Apollo records, unavailable layers and panel usable with no horizontal overflow.

## Files added or changed for Moon support

- `src/types/cosmos.types.ts` — `BodyId` includes `moon`; shared `BodyConfig`/`DeviceRecord` types; optional `attributionPath`.
- `src/config/bodyCatalog.ts` — Mars and Moon body configuration, telemetry and layer disclosures.
- `src/config/atlasPOIs.ts` — shared landmark helper with per-POI sources and Moon landmarks.
- `src/config/deviceManifest.json` — 13 records, including six unloadable Moon records.
- `scripts/import-mars-assets.py` — deterministic Mars import plus Moon record generation.
- `public/assets/provenance/apollo-equipment.csv` — preserved supplied Apollo equipment notes.
- `src/core/loaders/useProgressiveAsset.ts` — shared body texture type, Mars/Moon procedural generators and shared normal-map helper.
- `src/scene/mars/MarsLODMesh.tsx` — shared body mesh; selects the illustrative generator and disposes owned textures on change.
- `src/scene/mars/MarsPlanetGroup.tsx`, `src/scene/CosmosSceneRoot.tsx` — body-driven shared scene; keyed remount on body change.
- `src/store/useCosmosStore.ts` — body selection resets body-scoped state and ignores stale device-load reports.
- `src/config/validateCatalog.ts` — body, POI, device and body-target validation.
- `src/ui/hud/TopNavigationBar.tsx`, `CelestialQuickSelect.tsx`, `SubSceneInfoPanel.tsx` — body switcher, Moon records/POIs and truthful unavailable-record panel.
- `tests/catalog.test.ts` — Moon metadata/POIs/records, invalid fixtures and Mars → Moon → Mars state.
- `tests/browser/moon.spec.ts` — Moon globe/POIs/records, no lunar GLB requests, switching, failure isolation and narrow viewport.
- `README.md`, `docs/SOURCES.md`, `docs/IMPLEMENTATION_PROCESS.md` — scope, sources, commands and limitations.
- `docs/MOON_CHECKPOINT.md` — this record.

The pre-existing Mars implementation and all uncommitted/untracked files were preserved. No reset, clean, revert, commit or deployment was performed.

## Validation commands and results

| Command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | 15 passed, 0 failed |
| `npm run validate:assets` | 5 loadable Mars GLBs valid; byte counts and SHA-256 verified; 0 external URIs |
| `npm run build` | passed; Vite emitted the existing >500 kB chunk warning |
| `npm run test:browser` | 12 passed (7 Mars + 5 Moon) |

Browser runs used Playwright with Chrome, the repository's configured SwiftShader flags, reduced motion, one worker, 1440×1000 desktop and 390×844 narrow viewport. The combined suite covers Mars globe/models/cleanup/error recovery, Ingenuity camera/rotor/subsystem controls and error gating, Moon globe/POIs/records, Mars → Moon → Mars switching (including active Ingenuity state reset), Mars failure isolation, and narrow layouts.

## Remaining caveats

- No lunar GLB or measured lunar imagery/elevation/thermal dataset was supplied. The Moon has no loadable device models by design; the six Apollo entries are records only.
- South Pole–Aitken is represented at a published NASA view center, not an IAU feature center or a landing coordinate.
- Moon feature coordinates are stored from planetographic, east-positive Gazetteer values as east-positive 0–360° for near-spherical display; alternate control networks can differ.
- The globe textures and lighting are illustrative for both bodies. Rotations are elapsed-time animations, not mission clocks or ephemerides.
- Mars model previews remain normalized to two scene units. Physical scale, mission configuration, rigging and deployment positions are unverified.
- Sojourner is third-party CC BY 4.0 material; attribution is preserved, but redistribution review remains an operational responsibility.
- No deployment was attempted. `vercel.json` exists, but no configured, authorized target or credentials were verified.
- This is a scoped evidence catalog, not an exhaustive inventory of Mars or Moon exploration hardware.
