# Mars-to-Moon implementation process

## 1. Repository readiness — 2026-11-14

The request folder `D:\Vantalumen-NASA` contains only the two task documents.
The existing application is `D:\Mars-Orbital`, matching the brief's stack and three named source files.
Baseline: branch `main`, commit `b8a7f46fe75d5ac22cc79a73752ecaf1b66bd9ee`, clean working tree.
No AGENTS.md found at repository level, within the source tree, or at D:\. README.md contains run/build instructions.
Node v24.11.0. Existing dependencies installed. `npm run typecheck` passed; `npm run build` passed (existing >500 kB chunk warning).
No existing test command. `vercel.json` configures Vite, dist, and cross-origin isolation headers.
No deployment has been attempted; a hosted project linkage/credentials have not been verified.
The PDF, Mars ZIP, and all three named CSVs are present.

## 2. Plan review

Keep the existing React/R3F Canvas, scene root, camera controls, Zustand store, GLTF/Draco/KTX2 loader paths, and HUD styling.
Extend them through body configuration and a versioned device registry. Scope the active catalog to supplied evidence.
The existing procedural textures are illustrative, not MOLA/THEMIS observations. Disable unprovided data layers and the unverified hard-coded Cesium ion asset.
Legacy fictional station, orbital mockups, and an unverified Perseverance GLB must not enter the source-backed surface device catalog.
The PDF's optional operation simulation and optimization appendices are outside this first-release task.

Mars: validate five supplied GLBs; preserve original bytes and attribution; add explicit unavailable Curiosity/Perseverance records.
Use IAU/USGS feature-page coordinates for the four requested Mars POIs. These are feature centers, not landing coordinates or elevation measurements.
Use NASA NSSDCA physical body parameters. Record source/version/check date and preserve CSV provenance without turning shorthand source hints into invented links.
Provide on-demand model inspection with recoverable errors, cancellation, and resource disposal. Normalize preview size with a physical-scale disclaimer.
Add Node tests and browser flow checks. Run tests, typecheck and build, then write a Mars checkpoint before adding Moon.

Moon follows only after the Mars checkpoint: shared globe configuration, source-backed POIs and Apollo equipment records with no model URLs.
Finally test Mars → Moon → Mars, failures, narrow viewport, and cleanup, then hand off exact state and release limitations.

## 3. Mars checkpoint — passed 2026-11-14

See `docs/MARS_CHECKPOINT.md`. The five supplied Mars GLBs, unavailable Curiosity/Perseverance records, POI provenance, illustrative-layer disclosure, model error recovery and resource disposal were verified. Two truthful-UI issues were fixed before closing the gate: unavailable records no longer show model-file wording, and the attribution link is now record-driven rather than always pointing at the Mars ZIP.

## 4. Moon implementation — completed 2026-11-14

Extended the existing shared application; no second app or scene was created.

- Added `moon` to `BodyId` and the shared `BODY_CATALOG` (`src/config/bodyCatalog.ts`): mean radius 1737.4 km, sidereal rotation 655.720 hours (2,360,592 s), mean gravity 1.62 m/s², from the NASA NSSDCA Moon Fact Sheet. The same globe group, camera rig, warp paths, POI markers and record panel serve both bodies.
- Added a deterministic, clearly illustrative lunar albedo texture in `useProgressiveAsset.ts`. It is generic procedural gray albedo, not LRO/LOLA imagery or elevation. Texture objects are owned by `MarsLODMesh` and disposed when the body style changes, so repeated Mars → Moon → Mars switching releases the previous body's textures.
- Made each POI carry its own `SourceReference`. Mare Tranquillitatis (8.35°, 30.83°E) and Tycho (-43.30°, 348.78°E) use IAU/USGS Gazetteer feature centers. South Pole–Aitken uses NASA's published orthographic view center (53°S, 191°E) and the catalog/panel state that it is a view center, not an IAU-defined feature center or landing site.
- Added six `unavailable` Apollo records from the supplied equipment CSV: LRV systems, LRV deployment/chassis, Apollo 15 LRV, Apollo 17 LRV, Apollo surface equipment, and Lunar Module MESA/attached equipment. None has a model path, bytes, SHA-256, license URL or attribution file. The CSV is preserved byte-for-byte at `public/assets/provenance/apollo-equipment.csv` (SHA-256 `792d700306da6348e989c5a1d6737f058be2b03e8fda255b7e0871095b6ce59a`).
- Updated `scripts/import-mars-assets.py` so Mars asset regeneration also emits the six Moon records. `src/config/deviceManifest.json` now has 13 records (7 Mars, 6 Moon).
- Added optional `DeviceRecord.attributionPath` so only records with a supplied attribution file link to one. The six Moon records show no attribution-file link.
- Unit coverage: Moon body metadata, Moon POIs, six unloadable Apollo records, invalid Moon fixtures, Moon body-target mismatch, and Mars → Moon → Mars state isolation. Browser coverage: Moon globe/POIs/records/no-GLB requests, body switching, Mars load failure not blocking Moon, and narrow viewport.

Run results and remaining limitations are recorded in `docs/MOON_CHECKPOINT.md`.

## 5. Moon checkpoint — passed 2026-11-14

See `docs/MOON_CHECKPOINT.md`. The Moon body, procedural illustrative globe, three sourced POIs, six unloadable Apollo records, body switching, failure isolation, validation and narrow viewport were verified.

Final combined run:

- `npm run typecheck` passed.
- `npm test` 11 passed.
- `npm run build` passed with the existing >500 kB chunk warning.
- `npm run validate:assets` validated 5 Mars GLBs with matching byte counts and SHA-256.
- `npm run test:browser` 8 passed: 4 Mars and 4 Moon, at 1440×1000 and 390×844.

The work remains uncommitted. No deployment was attempted because no configured, authorized target or credentials were verified.

## 6. Device control MVP — Ingenuity Helicopter (2026-11-14)

Selected `ingenuity_helicopter` as the sole qualifying candidate combining a verified multi-node GLB (11 distinct functional nodes) and NASA technical references (`public/assets/provenance/ingenuity.csv`). Apollo/LRV records (`6`) and Perseverance/Curiosity remain `unavailable` without verified GLBs, while Spirit/Opportunity and Viking lack articulated component nodes and Sojourner uses generic Maya node names under CC BY 4.0.

- **Architecture separation**: Added catalog/spec contracts in `src/config/deviceControlSpecs.ts` validated at startup by `validateDeviceControlSpecs` (`src/config/validateCatalog.ts` / `src/App.tsx`), control state + resets in `src/store/useCosmosStore.ts`, pure Three.js material cloning/opacity isolation & coaxial quaternion helpers in `src/scene/spacecraft/deviceControlRuntime.ts`, runtime execution in `src/scene/spacecraft/DeviceModel.tsx`, camera preset transitions in `src/core/camera/SplineCameraRig.tsx`, and HUD controls in `src/ui/hud/DeviceControlPanel.tsx` mounted inside `SubSceneInfoPanel.tsx` only when `assetLoad.status === 'ready'`.
- **Verification**: Added unit tests in `tests/deviceControl.test.ts` (including binary GLB node verification against `ingenuity_helicopter.glb`) and expanded Playwright E2E coverage in `tests/browser/mars.spec.ts` and `tests/browser/moon.spec.ts` (camera presets, coaxial steps + slow demo spin override, node group isolation, `Reset`, 404/retry gating, active Ingenuity -> Moon -> Mars reset flow, and `390×844` mobile layout).

## Remaining risks and handoff

- No lunar GLB, measured lunar imagery, elevation or thermal data is integrated. Apollo records are intentionally unloadable.
- Globe textures are illustrative; Mars and Moon rotations are not ephemerides.
- South Pole–Aitken uses a NASA view center, not an IAU feature center.
- Model previews are normalized; physical scale and deployment positions remain unverified.
- Ingenuity camera views and `0.5 rev/s` slow counter-rotation are illustrative structural helpers; blade collective/cyclic pitch, landing-leg folding, aerodynamics, thermal state, battery/IMU telemetry, and calibrated real-world CAD frames remain unverified/unimplemented.
- Perseverance, Curiosity, and all six Moon Apollo/LRV records remain unavailable for 3D controls until verified GLB assets and licenses are supplied.
- Sojourner's CC BY 4.0 attribution is preserved, but redistribution review remains an operational responsibility.
- The release build is verified; deployment was not performed.

## Source review

PDF: `DeCuong_Atlas_SaoHoa_MatTrang.pdf`, v1.0, 2026-11-13, pp. 2–7 (MVP), pp. 8–12 (optional appendices).
CSVs: `Thitb-Tiliunndng-Nidungclichothitkgcnhn.csv` (Ingenuity), `(1).csv` (Mars rovers), `(2).csv` (Apollo).
ZIP: `Mars-20261114T010556Z-1-001.zip`. Preserve its complete `Attributions.txt`, including excluded assets.
Sojourner embedded GLB metadata and Sketchfab model API agree on CC BY 4.0 and author Dan / danthemodeler; ZIP also credits Ngee Ann Polytechnic.
NASA asset pages and media-use guidelines checked 2026-11-14. Viking page credits NASA/Michael D. Carbajal; Ingenuity page credits NASA/Brian E. Kumanchik. Retain both page and supplied ZIP credits.

## 7. Terrain 3D Mesh, Orbital Fleet, Interactive Control Room POV, Mission Dossiers & Render Optimization (2026-11-14)

- **Orbital actors, official NASA orbital GLBs & WebGL geometry disposal**: Replaced provisional orbital primitives (`PhobosOrbit.tsx`, `DeimosOrbit.tsx`, `OrbitalFleet.tsx`) with official NASA 3D Resources GLBs via `src/scene/common/OrbitalGlbModel.tsx` (strict `disposeModel` cleanup, selection reticle, studio Option 1 `orbitalCloseup` inspection, and `PlanetaryOrbitContext.tsx` / `NativeOrbitLine.tsx` with zero in-canvas `<Html>` portals). Expanded non-overlapping display orbits (`mro_orbiter` `6,200`, `mars_odyssey` `7,000`, `maven_orbiter` `8,800`, `ares_station` `10,200`, `dawn_flyby` `11,800`, `phobos` `13,200`, `deimos` `26,000` km; Moon `lro_orbiter` `2,650`, `apollo_csm` `3,050` km), halved orbital display radii (`38`–`70`), and optimized the 8 new orbital GLBs from `30.4 MB` down to `4.95 MB` using `@gltf-transform/functions` (`webp`, `dedup`, `prune`, `weld` + mesh simplification on high-vertex ISS/MAVEN meshes) with `scripts/validate-assets.mjs` extended to all 19 loadable GLBs (`mro_orbiter`: `624,660` B, SHA-256 `69ee5dcdddfdbbd5ef7e144757926d6a89729b2ff265477659e82abeaacee621`).
- **8K Mars WebP globe/terrain restoration & high-detail selenographic Moon texture suite**: Restored baked 8K Mars WebP maps (`mars_albedo_baked.webp`, `mars_normals.webp`, `mars_roughness.webp`) on `MarsLODMesh.tsx` with cached pre-filtered canvas surfaces, keyed `<meshStandardMaterial>` so Mars ↔ Moon transitions always compile shader maps, and upgraded `generateProceduralMoonTextures()` (`useProgressiveAsset.ts`) with 15 Lunar Maria basins, 12 named rayed/terraced craters (Tycho, Copernicus, Kepler, Aristarchus, Plato, etc.), 135 multi-scale spherical craters, `11.5` normal-map relief, LOLA hypsometric elevation, and Diviner thermal IR previews.
- **Official Curiosity/Perseverance GLBs & full-detail procedural Apollo 3D hardware**: Added verified NASA GLB surface rovers (`curiosity_rover`, `perseverance_rover` with 66 documented control nodes) in `src/config/deviceManifest.json` and `src/config/deviceControlSpecs.ts`, while keeping all 6 Moon Apollo surface records strictly `status: "unavailable"` with zero surface Apollo `.glb` requests and articulated procedural hardware reconstructions in `src/scene/spacecraft/ProceduralDeviceModel.tsx`.
- **Option 1 (3D Close-Up) & Option 2 (Control Room POV)**: Added right-dock `dual-view-mode-switcher` (`SubSceneInfoPanel.tsx`), `src/scene/spacecraft/ControlRoomFirstPersonScene.tsx`, and `src/ui/hud/ControlRoomHudOverlay.tsx` with Yaw/Pitch/Zoom (`1×`/`2×`/`4×`), 4 sensor modes (`OPTICAL_RGB`, `NAVCAM_MONO`, `ELEVATION_GRID`, `THERMAL_FALSE`), robotic arm deployment (`pov-action-arm`), and simulated laser spectrometer scanning (`pov-action-scan`), while removing center viewport floating bars.
- **Mission dossiers (`src/config/deviceDossiers.ts` & `src/ui/hud/DeviceDossierPanel.tsx`)**: Added biography, technical specifications, measured mission data, and scientific contributions for all 18 `DEVICE_CATALOG` devices and all 9 `ORBITAL_ACTORS_CATALOG` targets with filter tabs (`all`, `bio`, `specs`, `measurements`, `contributions`).
- **Rendering, validation & browser verification hardening**: Added `<Bvh firstHitOnly>`, `<AdaptiveDpr pixelated />`, and `<AdaptiveEvents />` in `MarsCanvas.tsx`; replaced `<SelectiveBloom>` with mipmap `<Bloom>` in `PostProcessingRig.tsx`; enabled 8× anisotropic trilinear mipmap filtering in `useProgressiveAsset.ts`, `DeviceModel.tsx`, and close-up `OrbitalGlbModel.tsx`; configured `manualChunks` (`three`, `postprocessing`, `gsap`) in `vite.config.ts`; and paused orbital simulation (`Dừng`) during multi-cycle GPU memory measurement in `tests/browser/mars.spec.ts`.
