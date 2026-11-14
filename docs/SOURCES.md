# Sources and asset provenance

Reviewed 2026-11-14 (Asia/Bangkok). This is a scoped educational catalog, not a complete inventory of NASA exploration. No NASA endorsement is implied.

## Supplied material

- `DeCuong_Atlas_SaoHoa_MatTrang.pdf`, v1.0 dated 2026-11-13: shared Atlas architecture and first-release scope (pp. 2–7); optional optimization/operation appendices (pp. 8–12).
- `Thitb-Tiliunndng-Nidungclichothitkgcnhn (1).csv`: Mars rover references, preserved at `/assets/provenance/mars-rovers.csv`.
- `Thitb-Tiliunndng-Nidungclichothitkgcnhn.csv`: Ingenuity references, preserved at `/assets/provenance/ingenuity.csv`.
- `Thitb-Tiliunndng-Nidungclichothitkgcnhn (2).csv`: Apollo equipment references. No lunar GLBs supplied.
- `Mars-20261114T010556Z-1-001.zip`: five Mars surface GLBs imported without modifying their bytes. Original attribution preserved at `/assets/attribution/Mars-Attributions.txt`, including credit for excluded spacecraft.

## Mars facts and coordinates

- [NASA NSSDCA Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html), last updated 2025-05-19: volumetric mean radius 3389.5 km, sidereal rotation 24.6229 hours, mean gravity 3.73 m/s². Rotation is an illustrative elapsed-time animation, not a mission clock or ephemeris.
- [Jezero, feature 14300](https://planetarynames.wr.usgs.gov/Feature/14300): 18.41°, 77.69°E.
- [Gale, feature 2071](https://planetarynames.wr.usgs.gov/Feature/2071): -5.44°, 137.70°E.
- [Olympus Mons, feature 4453](https://planetarynames.wr.usgs.gov/Feature/4453): 18.40°, 226.00°E.
- [Valles Marineris, feature 6288](https://planetarynames.wr.usgs.gov/Feature/6288): -13.74°, 300.80°E.

POIs use the default planetocentric, east-positive coordinate table on each IAU/USGS feature page as reviewed. Alternate control networks/search tables can show different center coordinates; these are approximate feature centers, not landing coordinates. No elevation measurement is attached. The 18 km marker offset is solely a display offset. Scene axes: +Y north, +X longitude 0°, -Z longitude 90°E.

## Moon facts and coordinates

- [NASA NSSDCA Moon Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html), last updated 2024-01-11: mean radius 1737.4 km, sidereal rotation 655.720 hours, mean surface gravity 1.62 m/s², mean orbital velocity 1.022 km/s, diurnal equatorial temperature range 95–390 K, surface pressure 3×10⁻¹⁵ bar. The globe's rotation is an illustrative elapsed-time animation, not a mission clock or ephemeris.
- [Mare Tranquillitatis, feature 3691](https://planetarynames.wr.usgs.gov/Feature/3691): center 8.35°, 30.83°E; diameter 875.75 km.
- [Tycho, feature 6163](https://planetarynames.wr.usgs.gov/Feature/6163): center -43.30°, -11.22° (stored as 348.78°E); diameter 85.29 km.
- [NASA Science · The Moon's Largest Basin](https://science.nasa.gov/resource/the-moons-largest-basin/): the published orthographic view is centered 53°S, 191°E. The South Pole–Aitken basin boundary is not defined by the IAU Gazetteer, so this marker is a view center, not an IAU feature center and not a landing coordinate.

The two IAU feature pages give planetographic, east-positive coordinates in the -180°–180° range. The Moon is treated as near-spherical for display, so the catalog stores these centers as east-positive 0°–360° without a planetocentric conversion. These are approximate feature centers; no elevation measurement is attached.

## Apollo equipment records

`Thitb-Tiliunndng-Nidungclichothitkgcnhn (2).csv` is preserved byte-for-byte at `/assets/provenance/apollo-equipment.csv` with SHA-256 `792d700306da6348e989c5a1d6737f058be2b03e8fda255b7e0871095b6ce59a` (verified against the supplied file). The six Moon records in `src/config/deviceManifest.json` summarize the CSV rows for LRV systems/operations, the LRV deployment mechanism and chassis, the Apollo 15 and Apollo 17 LRVs, Apollo surface equipment (MET, EVA, sampling and navigation), and the Lunar Module MESA/attached equipment.

All six records are `unavailable`: no model path, bytes, SHA-256, license URL or attribution file is claimed. They preserve supplied notes as educational records only; their summaries are not a substitute for the cited NASA/Lunar and Planetary Institute documents.

## Model credits and terms

| Supplied model | Preserved credit | Terms / evidence |
| --- | --- | --- |
| Sojourner | Dan / danthemodeler; Ngee Ann Polytechnic (ZIP credit) | [Sketchfab source](https://sketchfab.com/3d-models/mars-sojourner-rover-model-8b3810e7cd804bd6b0009520c67984c6), [model API](https://api.sketchfab.com/v3/models/8b3810e7cd804bd6b0009520c67984c6), embedded `asset.extras.license`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). API checked 2026-11-14: CC Attribution, author danthemodeler. |
| Spirit / Opportunity | NASA/JPL-Caltech | [Source page](https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/) and NASA media guidelines. One shared model represents the pair, not two different supplied GLBs. |
| Viking | NASA/Michael D. Carbajal (source page); NASA/JPL-Caltech (ZIP) | [Source page](https://science.nasa.gov/3d-resources/viking-lander/) and NASA media guidelines. |
| InSight | NASA/JPL-Caltech | [Source page](https://science.nasa.gov/resource/insight-lander-3d-model/) and NASA media guidelines. |
| Ingenuity | NASA/Brian E. Kumanchik (source page); NASA/JPL-Caltech (ZIP) | [Source page](https://science.nasa.gov/3d-resources/ingenuity-mars-helicopter/) and NASA media guidelines. |

[NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) include educational/informational 3D media use and require attribution; third-party material has separate terms. Preserve model credits and do not imply endorsement. Sojourner is separately licensed, not a NASA-authored model.

All models use a centered preview with longest dimension normalized to 2 scene units. Original file transforms/geometry/textures remain unchanged. The glTF meter convention does not verify real-world dimensions. Physical scale, mission-specific configuration, rigging, and mechanical operation are unverified. Unless explicitly controlled via the Ingenuity inspection MVP below, the renderer uses static poses.

## Ingenuity mechanism & camera reference basis (MVP)

Preserved project provenance at `/assets/provenance/ingenuity.csv` cites NASA technical sources (NASA Ingenuity Fact Sheet, NASA Rotor Geometry, NASA Landing Press Kit, and NASA Hover Modeling). The Ingenuity control specification (`src/config/deviceControlSpecs.ts`) distinguishes documented mission parameters from illustrative GLB inspection features:

- **Documented NASA facts**: `1.8 kg` Earth mass (`~0.68 kg` Mars weight), `0.49 m` fuselage/mast height, coaxial counter-rotating `1.21 m` carbon-fiber rotors operating at `~2,400 rpm` for up to `~90 s` flights, `13.6 × 19.5 × 16.3 cm` avionics enclosure housing 6 Li-ion cells recharged via the top solar array, `RTE 13 MP` color horizon-facing camera, `Navcam 0.5 MP` grayscale nadir navigation camera + laser altimeter, and `~13 cm` underside ground clearance across 4 carbon composite landing legs.
- **GLB-verified structure**: `ingenuity_helicopter.glb` contains 11 named nodes (`bus`, `cams`, `leg_01`–`leg_04`, `parts_01`, `parts_02`, `rotors_01`, `rotors_02`, `solar_panel`). Node transforms verify `rotors_01` and `rotors_02` align their local `[1, 0, 0]` axes along opposite world vertical directions (`+Y` and `-Y`).
- **Illustrative / omitted scope**: All four camera presets (`overview`, `coaxial_mast`, `rte_horizon`, `navcam_nadir`) and the `0.5 rev/s` slow counter-rotation demo mode operate purely in normalized 2-unit GLB scene coordinates for structural visibility and are explicitly labeled illustrative (`isIllustrativeView: true`), not calibrated CAD frames or aerodynamic hover physics. Collective/cyclic blade pitch, landing-leg folding, battery charge, IMU state, and thermal telemetry are omitted because the GLB lacks separate hinge/pitch pivots and no measured flight telemetry dataset is integrated.

## Coverage limits

No measured surface image, thermal layer, elevation raster, or terrain tileset has been supplied/configured for either body. The Mars and Moon globe textures and lighting are illustrative; the Moon texture is procedurally generated gray albedo, not LRO/LOLA imagery or elevation.

Curiosity and Perseverance are Mars records without loadable assets; the legacy repository's placeholder Perseverance GLB is not used. All six Moon Apollo records are documentation-only. No lunar GLB was supplied, so the Moon scene intentionally has no device models to load. Pioneer 10, Kepler, Dawn, and NEAR Shoemaker are excluded from these surface catalogs. Legacy orbital illustration files, including `public/assets/models/moons/`, remain outside the active scene.
