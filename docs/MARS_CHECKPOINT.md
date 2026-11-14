# Mars checkpoint — 2026-11-14

Status: **passed**. Moon work may start.

## Scope verified

- The five supplied Mars GLBs are the only loadable Mars surface assets: Sojourner, Spirit/Opportunity (one shared model), Viking, InSight, Ingenuity.
- Curiosity and Perseverance are catalog records only. They have no model path, no bytes and no SHA-256; the UI presents them as unavailable.
- Pioneer 10, Kepler, Dawn and NEAR Shoemaker are not present in either active body catalog. The legacy orbital/placeholder GLBs are not referenced by the active scene.
- Sojourner keeps the supplied ZIP credit (Ngee Ann Polytechnic) plus the Sketchfab author/CC BY 4.0 metadata. Spirit/Opportunity, Viking, InSight and Ingenuity keep their NASA source-page credits and the supplied ZIP credits where they differ.
- Mars POIs use the IAU/USGS feature-page centers recorded in `docs/SOURCES.md`: Jezero, Gale, Olympus Mons, Valles Marineris. The marker height offset is a display offset, not measured elevation.
- The globe texture and rotation are illustrative. Imagery, terrain/elevation and thermal layers are explicitly unavailable.
- Lazy loading, progress, missing-file, malformed-file, retry, stale-report rejection and resource disposal are covered by tests.

## Fixes made in this checkpoint

- Unavailable devices now render a truthful record panel: no “model version”, “original file”, normalization or download wording is shown for records that have no model.
- The provenance link is driven by an optional `attributionPath` on the device record. Mars available models point to the preserved ZIP attribution; unavailable records show no attribution-file link.
- Unavailable device selection no longer enters a model sub-scene or freezes the globe. It stays in the overview and keeps the record panel visible.
- The camera rig now reacts to device changes, so selecting an unavailable device cancels an in-flight globe flight correctly.
- Catalog validation now requires each body target to identify the same body.
- Tests assert the unavailable-record wording, the overview stage, and Mars attribution paths.

## Files changed for this checkpoint

- `scripts/import-mars-assets.py`
- `src/config/deviceManifest.json` (regenerated from the supplied ZIP)
- `src/config/validateCatalog.ts`
- `src/core/camera/SplineCameraRig.tsx`
- `src/core/canvas/FloatingOriginManager.tsx`
- `src/store/useCosmosStore.ts`
- `src/types/cosmos.types.ts`
- `src/ui/hud/SubSceneInfoPanel.tsx`
- `src/ui/hud/TopNavigationBar.tsx`
- `tests/catalog.test.ts`
- `tests/browser/mars.spec.ts`

The pre-existing Mars implementation and its uncommitted/untracked files were preserved. No reset, clean, revert or deployment was performed.

## Validation commands and results

| Command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | 20 passed, 0 failed (`catalog`, `deviceControl`, `resources`) |
| `npm run build` | passed with `manualChunks` (`three`, `postprocessing`, `gsap`) |
| `npm run validate:assets` | all 10 loadable GLBs (including 5 Mars surface GLBs) structurally valid; byte counts and SHA-256 match; 0 external URIs |
| `npm run test:browser` | 14 passed (8 Mars/Ingenuity + 6 Moon) at 1440×1000 and 390×844 |

The browser suite was run with Playwright/Chrome using the repository's configured SwiftShader launch flags at 1440×1000 and 390×844.

## Remaining caveats

- No production deployment was attempted. `vercel.json` exists, but no project linkage, authorization or credentials were verified.
- Mars imagery and terrain remain illustrative/unavailable; no measured elevation or thermal dataset is integrated.
- Model previews are normalized to two scene units. Physical scale, mission configuration, rigging and deployment position are unverified.
- Sojourner is third-party CC BY 4.0 material. Attribution is preserved; a legal redistribution review is still an operational responsibility.
- This remains a scoped evidence catalog, not an exhaustive list of Mars landers, rovers or deployed objects.

## Device Control MVP — Ingenuity Helicopter (2026-11-14)

- **Selected candidate**: `ingenuity_helicopter` (`/assets/models/mars/ingenuity_helicopter.glb`, `2,019,408` bytes, SHA-256 `9e5a5398ab335eae7d46335085301ce46fb7de052300b645debe8bac6d39f2b5`). Chosen because Moon LRV/Apollo records (`6`) and Perseverance/Curiosity are `unavailable` with no verified GLBs, while Spirit/Opportunity (`1` mesh) and Viking (`2` merged body meshes) lack separate articulating nodes and Sojourner uses third-party CC BY 4.0 generic node names.
- **Verified GLB hierarchy (11 named nodes)**: `bus`, `cams`, `leg_01`–`leg_04`, `parts_01`, `parts_02`, `rotors_01`, `rotors_02`, `solar_panel`. Verified directly against the GLB binary chunk header via unit test.
- **Documented camera views (illustrative)**:
  - `overview` (`Toàn cảnh 3/4`): full 11-node helicopter overview.
  - `coaxial_mast` (`Cụm Rotor & Pin mặt trời`): close-up on top `solar_panel`, `rotors_01`/`rotors_02` (`1.21 m` coaxial span), and `parts_01`/`parts_02`.
  - `rte_horizon` (`Camera màu RTE (13 MP · Ngang)`): low forward-offset view (`[0.68, -0.34, 0.22] -> [0.06, -0.22, 0]`) inspecting optics node `cams` mounted flush under the `+X` bottom rim of `bus`.
  - `navcam_nadir` (`Camera Navcam (0,5 MP · Xuống)`): upward nadir inspection view (`[0.08, -0.92, 0.38] -> [0.03, -0.24, 0]`) into `cams` and the underside avionics/altimeter bay (`bus`).
- **Coaxial rotor control & limits**:
  - `rotors_01` and `rotors_02` have verified opposite world spin axes (`+Y` and `-Y`) along local axis `[1, 0, 0]`, producing true coaxial counter-rotation from a single positive rotation delta relative to saved GLB rest quaternions.
  - Supports discrete step angles (`0°`, `45°`, `90°`, `180°`) and a clearly labeled slow visual rotation mode (`0.5 rev/s`, illustrative only — explicitly contrasted with documented `~2,400 rpm` flight design speed).
  - Non-articulating subsystems (`solar_panel`, `bus`, `cams`, `leg_01`–`leg_04`) support non-destructive node isolation via per-mesh cloned materials (restored cleanly on `'all'` or disposal) without fabricating leg-folding animations, blade pitch links, or live mission telemetry.
- **Control gating & cleanup**: Controls only render once `assetLoad.status === 'ready'`, remain hidden on loading/error/`unavailable` records (e.g., 404/retry flow or other Mars models without specs), and reset cleanly on body switch, device switch, or `Reset`.
- **Files added/updated for Ingenuity MVP**: `src/types/cosmos.types.ts`, `src/config/deviceControlSpecs.ts`, `src/config/validateCatalog.ts`, `src/App.tsx`, `src/store/useCosmosStore.ts`, `src/scene/spacecraft/deviceControlRuntime.ts`, `src/scene/spacecraft/DeviceModel.tsx`, `src/core/camera/SplineCameraRig.tsx`, `src/ui/hud/DeviceControlPanel.tsx`, `src/ui/hud/SubSceneInfoPanel.tsx`, `src/ui/styles/hud.css`, `tests/deviceControl.test.ts`, `tests/browser/mars.spec.ts`, `tests/browser/moon.spec.ts`, `docs/SOURCES.md`, `docs/MARS_CHECKPOINT.md`, `docs/MOON_CHECKPOINT.md`, `docs/IMPLEMENTATION_PROCESS.md`.

## Terrain 3D Mesh, Orbital Systems, Dual-View Modes & Mission Dossiers (2026-11-14)

- **Terrain 3D mesh & 8K baked WebP suite**: Added `TERRAIN_MESH_3D` mode backed by `public/assets/models/mars/mars_terrain.glb` (456,528 B) and `public/assets/textures/mars_{albedo_baked,normals,roughness}.webp` on both the Mars globe (`MarsLODMesh.tsx`) and terrain patch (`MarsTerrainPatch.tsx`), lazy-loaded on demand (`0` surface `.glb` requests on initial globe load).
- **Official NASA orbital GLBs, expanded orbits & halved orbital scales**: Replaced all primitive orbital craft and moon meshes (`PhobosOrbit.tsx`, `DeimosOrbit.tsx`, `OrbitalFleet.tsx`) with official NASA 3D Resources GLBs rendered via shared `src/scene/common/OrbitalGlbModel.tsx` with clean `disposeModel` cleanup, expanded display orbital radii (`mro_orbiter` `6,200`, `mars_odyssey` `7,000`, `maven_orbiter` `8,800`, `ares_station` `10,200`, `dawn_flyby` `11,800`, `phobos` `13,200`, `deimos` `26,000` km), halved orbital display radii (`38`–`70` units), overview camera pullback (`radius * 5.2`), studio Option 1 (`orbitalCloseup`) orbital inspection in `CosmosSceneRoot.tsx`/`SplineCameraRig.tsx`, and GLB WebP + mesh optimization (`30.4 MB` -> `4.95 MB` across the 8 orbital GLBs; `mro_orbiter` `624,660` B, SHA-256 `69ee5dcdddfdbbd5ef7e144757926d6a89729b2ff265477659e82abeaacee621`). Orbital texture mipmap regeneration and shadow casting remain gated to studio Option 1 close-up (`reportToStore === true`) so overview frame pacing stays responsive.
- **Official NASA Curiosity & Perseverance GLBs**: Upgraded `curiosity_rover` (`11,860,016` B) and `perseverance_rover` (`11,687,880` B, 66 documented control nodes) in `deviceManifest.json` and `deviceControlSpecs.ts`, alongside fallback procedural support (`ProceduralDeviceModel.tsx`) for unmodeled records.
- **Option 1 (3D Close-Up) & Option 2 (Interactive Control Room POV)**: Added right-dock `dual-view-mode-switcher`, `orbitalCloseup` studio inspection for all orbital actors, and interactive onboard actuation (`pov-action-arm` robotic arm deployment & `pov-action-scan` laser spectrometer target scan) in `src/scene/spacecraft/ControlRoomFirstPersonScene.tsx` and `src/ui/hud/ControlRoomHudOverlay.tsx`, while keeping the center viewport free of floating overlay bars.
- **Rich mission dossiers (`src/config/deviceDossiers.ts` & `src/ui/hud/DeviceDossierPanel.tsx`)**: Added documented NASA biographies, technical specifications, measured mission data, and scientific/engineering contributions across all 18 `DEVICE_CATALOG` records and all 9 `ORBITAL_ACTORS_CATALOG` targets.
- **Rendering, validation & bundle optimization**: Enabled `<Bvh firstHitOnly>`, `<AdaptiveDpr pixelated />`, and `<AdaptiveEvents />` in `src/core/canvas/MarsCanvas.tsx`; replaced `<SelectiveBloom>` with mipmap `<Bloom>` in `src/core/postprocessing/PostProcessingRig.tsx`; enabled 8× anisotropic trilinear mipmap filtering in `useProgressiveAsset.ts` and `DeviceModel.tsx`; expanded `scripts/validate-assets.mjs` to validate all 19 loadable GLBs (12 manifest + 7 orbital); and split `three`, `postprocessing`, and `gsap` chunks in `vite.config.ts`.
