# Mars–Moon Atlas: guided exploration implementation plan

Prepared 2026-11-14, Asia/Bangkok. Status: proposed implementation backlog, not completed features.

The intended outcome is a visitor who can ask a question, explore a place, inspect relevant equipment, explain one supported finding, and recognize what remains unknown. Use the existing Atlas and its shared scene to deliver that learning journey.

## 1. Basis and current repository

Planning snapshot: `D:\Mars-Orbital`, HEAD `530b9de` (`Expand orbit and scale down models`), branch `main`. The workspace contains ongoing uncommitted changes. Preserve them; inspect the current diff again before implementation. This planning task changes no application source or existing tests.

Read the current README, Mars/Moon checkpoints, implementation notes, body/device/POI catalogs, dossiers, control specifications, store, HUD, canvas and shaders. Both bodies, model inspection, procedural hardware and Control Room POV already exist. Extend those capabilities instead of rebuilding the original Mars–Moon MVP.

The checkpoint documents describe earlier successful checks but also contain historical counts and subsequent extensions. Treat them as history, not proof that the current tree passes. Do not repeat their old counts in a new release report.

A fresh read-only browser check of `http://localhost:5173` loaded Mars and switched to Moon at 1440×1000 with reduced motion and Chrome/SwiftShader. It reproduced shader compilation errors: the warp fragment and atmosphere vertex/fragment inputs contain JavaScript `export default "/src/shaders/...glsl"` text. There were no uncaught page exceptions in this short check; a pageerror-only test therefore misses these failures. This was a targeted audit, not a full regression or physical-device performance test. Diagnostic JSON and screenshots are under ignored `test-results/experience-*` files. Aborted requests during the short audit are not, by themselves, evidence of missing model files.

The Space Apps winners URLs supplied in the request failed to load during this review. NASA's [official announcement of the ten 2025 winners](https://www.nasa.gov/learning-resources/stem-engagement-at-nasa/nasa-announces-2025-international-space-apps-challenge-global-winners/) was accessible and confirms the names and awards. The product mappings below are our design interpretations, not NASA recommendations or claims that the winning prototypes were independently validated.

## 2. Translate the inspiration into visitor value

| Inspiration | Atlas implementation | Observable value |
| --- | --- | --- |
| SpaceGenes+ | Sourced links among location, conditions, instrument and observation | Visitor explains a relationship, not just a fact |
| Resonant Exoplanets | Inspectable evidence for each claim | Visitor can locate the original source and limitation |
| Twisters | A question leads to a short, supported answer | Fewer unrelated controls to interpret |
| Astro Sweepers | Stewardship stories with explicit scope and assumptions | Visitor recognizes consequences without an opaque score |
| PureFlow | Bounded failure/recovery exercises | Visitor understands a constraint and a recovery choice |
| Photonics Odyssey | Text-first access and deliberate asset downloads | The journey survives weak connectivity or unavailable 3D |
| HerCode Space | Short human stories attached to places and discoveries | Narrative gives a reason to investigate |
| Gaia+LEO | Explain a documented Earth/space trade-off; measure app resource use | Connections have evidence and costs are visible |
| Zumorroda-X | Optional observation challenges and visual comparisons | Play supports a specific learning objective |
| QUEÑARIS | One reviewed, place-specific Earth connection | Local relevance has named sources and context |

Retain six principles throughout: evidence before spectacle; visitor choice; systems thinking; responsible exploration; access for everyone; and stories that lead back to science.

Working assumptions: Vietnamese remains the primary UI language; English names and instrument terms remain available as a glossary. Start with one short mission per body, with an always-available free-exploration route. No account, AI assistant, public upload system or backend is needed for this increment.

## 3. Target journey and first release scope

1. **Choose a world and a question.** Show Mars and Moon, a one-sentence purpose, one recommended mission for each, and “Explore freely”. Avoid loading model fleets behind the invitation.
2. **Orient on the globe.** Start with a calm view, selected-world label, a clear illustration/data status, and one next action. An optional camera move is skippable and stops under reduced motion.
3. **Visit a story stop.** Show a title, a short “why this matters”, one question and a sourced position. Keep “Back to globe” and “View evidence” visible.
4. **Inspect evidence.** Offer the few relevant claims or layers. Missing coverage remains understandable; an unavailable dataset does not prevent reading the story.
5. **Connect to hardware.** Explain why this device or instrument is relevant to this place. Open the existing model inspector or a record with clearly labeled reconstruction status.
6. **Try a bounded activity.** Use an appropriate existing view/control. State whether the output is a documented fact, a calculated teaching example or an illustration.
7. **Reflect.** Present one finding, the source supporting it and one unanswered question. Offer a next mission, a copied deep link and local progress saving.

The initial Mars candidate is a Jezero story connecting a scientific question to relevant Perseverance/Ingenuity observations. Exact relationships and claims must be reviewed before publication. Start the interactive exercise with the existing Ingenuity viewpoints: distinguish looking downward from looking toward the horizon, while identifying these camera placements as illustrative.

The initial Moon candidate uses Mare Tranquillitatis and Apollo 11 surface equipment/MESA, with a source-backed explanation of an observation or equipment task. Treat the existing procedural equipment as reconstruction. Do not attach Apollo 15/17 LRV operations to the Apollo 11 site. A later LRV story needs its own verified site/mission association and coordinates.

Each mission has a proposed 3–5 minute route with 3–4 stops. This is a design target, not measured completion time. Both routes must work as text and evidence cards if models or WebGL are unavailable. Free exploration preserves access to the broader reviewed catalog.

## 4. Delivery backlog

### P0 — Establish a stable and truthful baseline

**Outcome:** the current experience renders reliably and does not make contradictory scientific or asset claims.

| Ticket | Implementation | Existing files / seams | Acceptance |
| --- | --- | --- | --- |
| P0.1 Shader loading | Inspect the interaction between `assetsInclude: ['**/*.glsl', ...]` and `vite-plugin-glsl`. Choose one raw-text shader path, such as explicit `?raw` imports, and update declarations as needed. Verify dev and production separately. | `vite.config.ts`, `src/vite-env.d.ts`, `DeepSpaceStarfield.tsx`, `MarsAtmosphereMesh.tsx`, shader files | No compile/link errors across Mars, Moon, model and POV transitions; imported shader strings contain source, not module-export wrappers |
| P0.2 Failure containment | Add a canvas error boundary, explicit context-loss handling and shader-error reporting. A React boundary alone will not catch all GPU errors. Keep sources/navigation usable in a text view; allow retry or basic rendering without silently claiming full 3D success. | `MarsCanvas.tsx`, `rendererDiagnostics.ts`, `PostProcessingRig.tsx`, `App.tsx` | Forced WebGL denial/context loss and bad shader tests show an intelligible fallback and preserve body/story selection |
| P0.3 Catalog and credit audit | Check actual files, provenance and mission associations. Resolve the Sojourner dossier's NASA-geometry wording against its Dan/Ngee Ann Polytechnic/CC BY credit. Keep Pioneer 10, Kepler and NEAR out of the Mars surface device catalog. Treat Dawn's sourced Mars encounter as encounter context, not surface deployment or a present-day Mars orbit. Identify conceptual Ares and reference spacecraft explicitly. | `deviceManifest.json`, `deviceDossiers.ts`, `celestialCatalog.ts`, `validateCatalog.ts`, `docs/SOURCES.md` | Every visible entry has an explicit mission relationship and asset credit; no body filter implies unsupported deployment; duplicate device/orbital entries do not produce contradictory descriptions |
| P0.4 One status vocabulary | Separate the kind of representation from file-load status and scientific evidence. Make layer labels come from configuration rather than the hard-coded Mars button list. Reconcile the current “unavailable” layer metadata with enabled illustrative layer buttons. | `cosmos.types.ts`, `bodyCatalog.ts`, `CelestialQuickSelect.tsx`, `TopNavigationBar.tsx`, `SubSceneInfoPanel.tsx` | A procedural Apollo model is labeled “Illustrative reconstruction”, a missing model “Record only”, and generated color/elevation filters never imply MOLA/THEMIS/LOLA/Diviner observations |

Baseline commands: `npm test`, `npm run typecheck`, `npm run validate:assets`, `npm run build`, `npm run test:browser`. Extend browser assertions to inspect console shader errors as well as uncaught exceptions. Add a production-preview smoke check; the existing browser configuration starts the dev server.

The manifest now lists newly added Curiosity and Perseverance GLBs as available. Verify their files, hashes, sources and attribution; do not blindly revert them to the older checkpoint's “unavailable” description.

### P1 — Make the first minute clear

**Outcome:** a newcomer knows what to explore and how to proceed.

Add a small `MissionEntry` and `JourneyPanel` to the existing `App.tsx` shell. Add mission configuration rather than another scene. Update `CelestialQuickSelect.tsx` so the guided route prioritizes the current question and relevant destinations; move the full catalog behind an explicit “Explore freely” action. Hide orbital paths by default in guided mode while preserving the user's preference in free exploration.

Replace “Option 1 / Option 2” as primary labels with “Inspect model” and “Explore viewpoints”. Keep the mode details secondary. Replace asset-format labels such as “GLB + 8K” in primary navigation with descriptions of what visitors will see. Offer the full technical details in the evidence panel.

On desktop, preserve the globe as the main visual area with one task panel and contextual details. On narrow screens, use a compact header, a useful globe viewport, and an accessible document-flow panel/drawer; avoid forcing visitors through a long equipment list to reach the story. Keep unavailable-layer explanations readable without hover.

Implement browser-history state through a URL adapter for validated body, mission, stop, target and view IDs. Example: `?v=1&body=mars&mission=jezero-evidence&stop=observe`. Unknown IDs return to a valid overview with a clear message. Back/forward restores a meaningful step. Camera drag, animation ticks and simulated telemetry do not create history entries.

**Gate:** five first-time participants attempt “choose a world, open a story stop, explain the image status” without coaching. Proposed target: at least four succeed within 60 seconds. Also verify keyboard traversal, 390 px layout, reduced motion and browser Back/Forward. This is a formative check, not a statistical claim.

### P2 — Make evidence inspectable at the claim level

**Outcome:** visitors can tell what a fact means, where it came from and what it does not establish.

Introduce a source registry and reusable `EvidenceBadge`, `EvidenceCard` and `SourceDrawer`. Migrate `DossierMetric` beyond its current `{ label, value }` shape; its “Measured Mission Data” tab currently has no individual source/unit/date/method fields. Give narrative contributions claim references too. Preserve existing records during migration but do not promote unreviewed values to measured status.

Keep these three dimensions independent:

| Dimension | Proposed values | Meaning |
| --- | --- | --- |
| Evidence kind | measured, reported, derived, illustrative, unknown | How the claim or displayed value was produced |
| Representation | source model, procedural reconstruction, record only | What the visitor is viewing; a verified file does not verify physical fidelity |
| Runtime state | idle, loading, ready, error | Whether a resource loaded; this never upgrades its scientific status |

A claim records: stable ID, subject/mission, text or typed value, unit when applicable, source IDs, source locator, observation interval or publication date, version/check date, method and limitations. A derived value additionally records inputs and a reproducible method. Store uncertainty only when the source supplies it; otherwise say it is unspecified. “Unknown” data must not become zero.

A layer also records: body, coverage, coordinate reference/projection, physical resolution when known, display resolution separately, date/version, source, attribution/terms and failure state. An 8K texture dimension is not a ground-resolution measurement. Only offer side-by-side quantitative comparison when units, coverage, coordinate frame and time context are compatible. Otherwise provide an explicitly qualitative comparison.

Render the same evidence component in POI stories, device dossiers and activity results. One action opens the relevant source and locator. Historical measurements stay visually separate from app-generated POV readouts.

**Gate:** every factual claim used in the two initial missions resolves to reviewed provenance. Every remaining dossier item has a source or a visible unverified status. Tests reject duplicate IDs, missing references, unsupported measured labels, invalid units/coordinates and incompatible layer comparisons. Retain original per-asset attribution.

### P3 — Connect stories, hardware and learning

**Outcome:** each interaction helps answer the visitor's question.

Add `missionStories.ts` and a small relationship registry linking a story stop to a place, mission, instrument, evidence and capability. Each relationship carries its own source and role: deployed at, observed, regional context, flyby, or conceptual reference. Sharing a body ID is not proof of a relationship. Validate all references and prohibit accidental cross-mission links.

Reuse `DeviceModel`, `ProceduralDeviceModel`, `DeviceControlPanel`, `ControlRoomFirstPersonScene` and the current camera rig. Add capability metadata to `deviceControlSpecs.ts`: supported target, documented basis, illustrative/verified status, permitted inputs, output evidence type, reset behavior and limitations. A documented real-world mechanical limit is distinct from an interface yaw/pitch clamp.

Gate actions by capability. The current generic arm/boom and spectrometer buttons should not appear on every selected platform or POI. Retain supported camera inspection; label visual demos; omit unsupported actions. A simulated scan must never become a claimed composition measurement of the selected Mars/Moon site.

Implement one complete Mars route first and record its acceptance evidence. Then implement the Moon route with the same story/evidence/activity components. Each stop offers a short narrative, optional deeper detail, an observation prompt and a clear next step. Add one reflection prompt that asks the visitor to distinguish observation from inference, rather than rewarding clicks or speed.

Add an `ExplorationNotebook` containing visited stops, selected evidence, one takeaway and an unknown. Save a small versioned record locally, with reset and storage-failure handling. Provide a deep link and plain-text summary export. Sharing remains optional; do not add an account requirement or automatic external transmission.

**Gate:** a visitor completes a short route for each body and explains one finding plus its limitation. Test evidence links, unsupported-action suppression, model failure recovery, rapid switching, local progress restoration and invalid/stale deep links. Closing or switching out of an activity stops its animation and releases obsolete resources.

### P4 — Add resilience, access and responsible context

**Outcome:** the same educational value remains available across devices and imperfect conditions.

Accessibility starts in P1; this phase completes the audit. Target [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) with semantic navigation, visible focus, keyboard-operated tabs and drawers, text equivalents for meaningful canvas/POV information, and reduced motion covering auto-rotation and ongoing loops. The current POV overlay is entirely `aria-hidden`; retain decorative crosshairs as hidden but provide the meaningful state elsewhere. Use 44 CSS px as an internal touch-target goal, not as a statement of the AA minimum. Test zoom/reflow and screen-reader order manually as well as with automation.

Add a persistent low-data/text-first preference. Load mission text and sources first; defer high-resolution maps, fleet models and device GLBs until requested. Show download size before a large optional asset. Pause offscreen/hidden-tab work. Cache only bounded, versioned content with known redistribution terms. Offer a useful offline explanation and cached text where available; do not claim a full offline 3D mode without testing it.

Measure startup bytes, time to usable text, time to first useful 3D view, frame time and renderer-resource counts on a named laptop and a real phone. Use cold/warm cache runs and the same camera/content before and after changes. Software WebGL checks are for functional coverage, not hardware performance claims. Provisional targets: usable text within 3 seconds under a documented 1.6 Mbps/150 ms test profile; no GLB or 8K map requests before opt-in in low-data mode; resource counts return near the documented warm baseline after ten body/activity switches. Revise these targets only with measured evidence.

Add one reviewed resilience exercise after P2/P3: for example, choose a useful observation when one explicitly modeled view is unavailable. Explain what changed and why the alternatives remain useful. If the numbers or physics are not validated, use a qualitative teaching exercise with stated assumptions.

Add one optional stewardship/Earth-connection story when suitable evidence is ready. Separate analogy from demonstrated transfer, name the community/context, and cite any claimed benefit. Do not transplant a Low Earth Orbit debris score to Mars/Moon exploration. Do not invent a combined sustainability score. Broader hazard simulation, local/community content and numerical resource trade-offs remain separate later increments unless their inputs, method and validation are available.

**Gate:** the core journey works with keyboard, touch, reduced motion, WebGL unavailable and interrupted downloads. Users can tell a historical fact from simulated output. Each stewardship claim is sourced; each exercise states its assumptions and limits.

## 5. Implementation seams and state ownership

| Concern | Approach |
| --- | --- |
| Rendering | Keep `MarsCanvas`, `CosmosSceneRoot`, existing body/model/terrain adapters and one camera rig. Story steps dispatch existing selection actions; they never mount a second scene. |
| Content | Keep scientific content outside components. Extend `bodyCatalog`, `atlasPOIs`, `deviceManifest`, `deviceDossiers` and `deviceControlSpecs`; add registries for reviewed claims, relationships and stories. |
| Journey state | Extend Zustand with mode (guided/free), mission ID, stop ID and current detail panel. Derive valid selection combinations instead of adding unrelated booleans. Keep renderer/loading states separate. |
| URL | Add a parser/serializer with allowed IDs, versioning and fallback behavior. Apply body/target/view changes atomically to avoid stale callbacks and duplicated loads. |
| Persistence | Store lightweight progress and preferences, not Three.js objects, model buffers or telemetry. Leaving a body resets live controls; saved story progress can be resumed explicitly. |
| UI | Extract source/evidence components and contextual activity controls from the growing `SubSceneInfoPanel`; preserve existing functionality during migration. |
| Measurement | Initially use local QA logs and user-test notes. Add events such as mission_started, evidence_opened, activity_completed, fallback_shown and reflection_completed only after defining their purpose; no external analytics service is needed for the first increment. |

Use feature flags for guided entry and the new evidence presentation so existing free exploration remains available during development. Migrate both UI and content together; avoid two conflicting status systems. Keep the Mars-first checkpoint before extending each shared feature to Moon.

## 6. Sequence, effort and ownership

Estimates are planning ranges for one developer familiar with this codebase, with a science/content reviewer available. They are not calendar commitments. New terrain procurement, asset authoring, translations and unplanned shader/driver investigations are excluded.

| Increment | Dependencies | Developer effort | Review responsibility |
| --- | --- | --- | --- |
| P0 baseline and critical truth corrections | Current tree inspection | 2–3 days | Engineering plus source/asset review |
| P1 guided entry, progressive disclosure, URL state | P0 status contract and stable rendering | 3–4 days | UX plus first-time visitor sessions |
| P2 claim evidence and content migration | P0 vocabulary; used by P1 shell | 3–5 days | Science/content reviewer |
| P3 Mars route, then Moon route, activities and notebook | P1 + reviewed P2 content | 4–6 days | Engineering, content and learning review |
| P4 access, bandwidth, resilience and one sourced context story | Core P3 journey; accessibility work starts in P1 | 3–5 days | QA, accessibility and content review |

Full scope: roughly 15–23 developer-days plus review turnaround. Re-estimate after P0. If time is limited, ship P0, the P1 shell, P2 coverage for one mission and the Mars P3 route first; existing Moon free exploration remains available. Then reuse the verified route components for Moon. Do not trade source accuracy or accessibility for extra scenes.

## 7. Acceptance and release evidence

| Value | Proposed check |
| --- | --- |
| First-minute clarity | At least 4/5 formative participants choose a world, reach a story stop and identify content status within 60 seconds |
| Evidence literacy | At least 4/5 distinguish a sourced historical measurement from an illustrative view and open the supporting source without help |
| Learning | At least 4/5 give one correct takeaway and one limitation after a route; record the prompts and scoring rubric |
| Content integrity | All initial-route claims and relationships have reviewed sources; every displayed scientific value has a source or explicit unknown/unverified status |
| Recovery | Model 404, malformed GLB, decoder/texture failure, shader failure and context loss have recoverable outcomes; switching worlds stays usable |
| Navigation | Keyboard-only route, Back/Forward, direct links, refresh and local progress recovery pass; no focus traps or hidden focused controls |
| Access and performance | Verify text-first/low-data behavior, 390 px and 320 px layouts, 200% zoom, reduced motion and one physical phone; report measured timings and resource behavior |

Extend existing Node tests and Playwright suites rather than creating a parallel framework. Browser coverage must collect console and page errors, exercise dev and production, include normal-motion and reduced-motion projects, and test Mars → Moon → Mars during active loading/POV sessions. Review screenshots for readability and content status, not merely pixel similarity.

For each completed increment, record changed files, reviewed claims/assets, exact validation commands/results, browser/device conditions and remaining limitations. The release gate is the current repository state passing its checks; old checkpoints do not satisfy it. Use the existing Vercel setup only when the actual target is configured and deployment is authorized. Missing deployment configuration does not block implementation or local verification.

## 8. Source references for this plan

- [NASA 2025 Space Apps winners announcement](https://www.nasa.gov/learning-resources/stem-engagement-at-nasa/nasa-announces-2025-international-space-apps-challenge-global-winners/), published 2025-12-18, accessed 2026-11-14: winner identities and inspiration only.
- [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), accessed 2026-11-14: reference for UI review; applied selectively to this app, not treated as repository instructions.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), accessed 2026-11-14: accessibility target; conformance requires implementation and evaluation.
- Existing supplied brief/CSVs, catalog source references and `docs/SOURCES.md`: inputs to the required content audit, not automatic verification of every newly added dossier claim.
- Installed Three.js source exposes `renderer.debug.onShaderError` and context-loss handling; inspect the installed version while implementing P0 instead of relying only on the latest online API.
