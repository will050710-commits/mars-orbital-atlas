export interface DossierMetric {
  label: string;
  value: string;
}

export interface DeviceDossier {
  id: string;
  agencyAndProgram: string;
  era: string;
  biography: string;
  technicalSpecs: DossierMetric[];
  measuredData: DossierMetric[];
  contributions: string[];
  modelDisclaimer: string;
}

export const DEVICE_DOSSIERS: Record<string, DeviceDossier> = {
  sojourner_rover: {
    id: 'sojourner_rover',
    agencyAndProgram: 'NASA / JPL · Mars Pathfinder Discovery Mission',
    era: 'Launched Dec 4, 1996 · Landed Ares Vallis Jul 4, 1997 (83 sols)',
    biography:
      'Sojourner was humankind’s first wheeled rover to operate on another planet, proving autonomous hazard-avoidance navigation and rocker-bogie mobility across flood-carved terrain at Ares Vallis.',
    technicalSpecs: [
      { label: 'Rover Mass', value: '10.6 kg (Earth) · 6-wheel rocker-bogie' },
      { label: 'Dimensions', value: '0.65 m L × 0.48 m W × 0.30 m H' },
      { label: 'Power System', value: '0.22 m² GaAs solar panel (~16 W peak) + LiSOCl₂ backup' },
      { label: 'Instruments', value: 'APXS (Alpha Proton X-Ray Spectrometer), 3 cameras' },
    ],
    measuredData: [
      { label: 'Traverse Distance', value: '~100 m total (within 12 m of Carl Sagan Memorial Station)' },
      { label: 'Sample Analyses', value: '16+ rock and soil APXS chemical assays' },
      { label: 'Air Temp Range', value: '-10 °C daytime peak to -76 °C pre-dawn (Pathfinder ASI/MET)' },
    ],
    contributions: [
      'Analyzed high-silica andesite-like rocks (Barnacle Bill) and basaltic soils (Yogi, Scooby Doo).',
      'Imaged rounded pebbles and conglomerate textures consistent with past episodic flooding.',
      'Validated lightweight airbag EDL and laser-stripe hazard detection for later MER and MSL rovers.',
    ],
    modelDisclaimer:
      'Displays the verified NASA 3D GLB geometry; runtime rover motion and POV telemetry in this app are illustrative.',
  },

  spirit_and_opportunity_rover: {
    id: 'spirit_and_opportunity_rover',
    agencyAndProgram: 'NASA / JPL · Mars Exploration Rovers (MER-A & MER-B)',
    era: 'Landed Jan 2004 · Operated 2004–2010 (Spirit) & 2004–2018 (Opportunity)',
    biography:
      'Twin solar-powered robot geologists dispatched to opposite sides of Mars—Gusev Crater and Meridiani Planum—originally planned for 90 sols and ultimately operating for 6 and 14 years.',
    technicalSpecs: [
      { label: 'Rover Mass', value: '185 kg per rover' },
      { label: 'Mobility', value: '6-wheel rocker-bogie · 0.05 m/s top speed' },
      { label: 'Athena Payload', value: 'Pancam, Mini-TES, Mössbauer, APXS, Microscopic Imager, RAT' },
      { label: 'Power System', value: 'Triple-junction GaInP/GaAs/Ge solar arrays + Li-ion batteries' },
    ],
    measuredData: [
      { label: 'Odometer Record', value: '45.16 km (Opportunity) · 7.73 km (Spirit)' },
      { label: 'Water Signatures', value: 'Jarosite, sulfates, hematite concretions, pure silica (>90% SiO₂)' },
      { label: 'Deepest Dust Storm', value: 'Optical depth τ > 10.8 (2018 global dust storm ending Opportunity)' },
    ],
    contributions: [
      'Opportunity discovered cross-bedded sulfate sandstones and hematite "blueberries" formed in ancient standing acidic groundwater at Meridiani Planum.',
      'Spirit uncovered hydrothermally altered amorphous silica (~90% purity) near Home Plate in Columbia Hills, pointing to past hot-spring activity.',
      'Set an off-world driving endurance benchmark exceeding 45 km over Martian terrain.',
    ],
    modelDisclaimer:
      'Displays the verified NASA MER 3D GLB mesh; onboard Control Room POV panels represent illustrative reconstructions.',
  },

  viking_lander: {
    id: 'viking_lander',
    agencyAndProgram: 'NASA / Langley & JPL · Viking 1 & Viking 2 Landers',
    era: 'Landed Jul 20, 1976 (Chryse Planitia) & Sep 3, 1976 (Utopia Planitia)',
    biography:
      'First U.S. spacecraft to land safely and conduct sustained multi-year surface operations on Mars, establishing the baseline meteorology and soil chemistry of the northern plains.',
    technicalSpecs: [
      { label: 'Landed Mass', value: '~576 kg dry (3-leg crushable honeycomb pads)' },
      { label: 'Power System', value: 'Two SNAP-19 Pu-238 RTGs (~70 W electrical combined)' },
      { label: 'Sampling', value: '3 m extendible collector boom + backhoe sieve' },
      { label: 'Instruments', value: 'Twin facsimile cameras, GCMS, XRFS, biology package, meteorology' },
    ],
    measuredData: [
      { label: 'Surface Pressure', value: '6.5 to 10.8 mbar seasonal CO₂ condensation cycle' },
      { label: 'Surface Temp', value: '-107 °C winter minimum to -17 °C summer peak' },
      { label: 'Atmospheric Bulk', value: '95.3% CO₂ · 2.7% N₂ · 1.6% Ar · trace O₂/CO/H₂O' },
    ],
    contributions: [
      'Delivered the first clear surface panoramas of Mars and multi-year daily weather records (Viking 1 operated 2,245 sols).',
      'Measured global atmospheric CO₂ freeze-thaw pressure oscillations between northern and southern polar caps.',
      'Detected reactive oxidants (later linked to perchlorates) while constraining near-surface organic carbon sensitivity.',
    ],
    modelDisclaimer:
      'Displays the verified NASA Viking Lander 3D GLB file; interactive views are for inspection, not physical dynamics simulation.',
  },

  insight_lander: {
    id: 'insight_lander',
    agencyAndProgram: 'NASA / JPL & CNES / DLR · Discovery Mission 12',
    era: 'Launched May 5, 2018 · Landed Elysium Planitia Nov 26, 2018 (1,440 sols)',
    biography:
      'A stationary geophysical observatory dedicated to listening to Mars’s deep interior heartbeat using a ultra-sensitive dome-shielded seismometer, precision radio tracking, and meteorology boom.',
    technicalSpecs: [
      { label: 'Landed Mass', value: '358 kg · two 2.15 m decagonal solar wings' },
      { label: 'Deployment Arm', value: '2.4 m 4-DOF Instrument Deployment Arm (IDA) + scoop' },
      { label: 'Geophysics Suite', value: 'SEIS (VBB+SP seismometers), HP³ mole, RISE X-band transponder' },
      { label: 'Weather Sensors', value: 'APSS pressure transducer, TWINS wind booms, IFG magnetometer' },
    ],
    measuredData: [
      { label: 'Marsquakes Logged', value: '1,319+ seismic events (up to Magnitude ~5 on May 4, 2022)' },
      { label: 'Liquid Core Radius', value: '~1,830 km ± 40 km molten Fe-Ni + light elements' },
      { label: 'Crustal Thickness', value: '~24–72 km beneath InSight (39 km global reference layers)' },
    ],
    contributions: [
      'Confirmed Mars remains seismically and tectonically active, notably around the Cerberus Fossae graben system.',
      'Directly measured the boundary radii and density of the Martian crust, mantle, and liquid metallic core for the first time.',
      'Captured first acoustic infrasound of Martian winds, vortex pressure drops, and meteoroid impact seismic waves.',
    ],
    modelDisclaimer:
      'Uses the verified NASA InSight GLB with articulated 83-node arm/turret hierarchy bounded within illustrative safety angles.',
  },

  ingenuity_helicopter: {
    id: 'ingenuity_helicopter',
    agencyAndProgram: 'NASA / JPL & AeroVironment · Mars 2020 Technology Demo',
    era: 'First flight Apr 19, 2021 · 72 flights completed through Jan 18, 2024',
    biography:
      'The first aircraft in history to achieve controlled, powered aerodynamic flight on another planet, overcoming Mars’s ~1% Earth sea-level air density inside Jezero Crater.',
    technicalSpecs: [
      { label: 'Flight Mass', value: '1.8 kg (680 g Earth-equivalent weight on Mars)' },
      { label: 'Rotor System', value: '1.2 m carbon-fiber counter-rotating coaxial blades (~2,400–2,900 RPM)' },
      { label: 'Avionics / Nav', value: 'Qualcomm Snapdragon 801 flight computer, NAV downward + RTE color cams' },
      { label: 'Power System', value: 'Top-mounted solar array charging 6 Sony Li-ion cells (~350 W flight peak)' },
    ],
    measuredData: [
      { label: 'Total Flight Record', value: '72 flights · 17.0 km cumulative distance · 128.8 min air time' },
      { label: 'Performance Peaks', value: 'Max altitude 24 m · max groundspeed 10 m/s · longest hop 704 m' },
      { label: 'Air Density', value: '~0.015–0.020 kg/m³ CO₂ (~1–1.5% of Earth sea level)' },
    ],
    contributions: [
      'Transitioned from a 5-flight experimental demo into Perseverance’s tactical aerial scout across hazardous dune fields and boulders.',
      'Proved supersonic-tip-margin coaxial aerodynamics and autonomous optical-flow visual odometry off-world.',
      'Established flight design heritage for future Mars rotorcraft sample-recovery and science helicopters.',
    ],
    modelDisclaimer:
      'Displays the verified NASA Ingenuity GLB (11-node helicopter tree); rotor spin speeds in this viewer are visual approximations only.',
  },

  dawn_spacecraft: {
    id: 'dawn_spacecraft',
    agencyAndProgram: 'NASA / JPL & UCLA · Discovery Mission 9',
    era: 'Launched Sep 27, 2007 · Mars Gravity Assist Feb 17, 2009 (~549 km)',
    biography:
      'The first spacecraft to orbit two extraterrestrial Solar System bodies (protoplanet Vesta and dwarf planet Ceres), executing an unpowered precision Mars slingshot in 2009.',
    technicalSpecs: [
      { label: 'Dry / Launch Mass', value: '747 kg dry · 1,217 kg launch (incl. 425 kg Xenon propellant)' },
      { label: 'Propulsion', value: '3× NSTAR xenon ion thrusters (specific impulse ~3,100 s)' },
      { label: 'Solar Wing Span', value: '19.7 m tip-to-tip (10.3 kW at 1 AU)' },
      { label: 'Science Suite', value: 'Framing Cameras, VIR imaging spectrometer, GRaND neutron detector' },
    ],
    measuredData: [
      { label: 'Mars Flyby Periapsis', value: '549 km altitude · +9,330 km/h delta-v equivalent assist' },
      { label: 'Total Ion Delta-V', value: '11.5 km/s achieved over 11-year deep-space mission' },
      { label: 'VIR Checkouts', value: 'Infrared thermal/surface calibration passes across Mars during 2009 flyby' },
    ],
    contributions: [
      'Used Mars’s gravity well to incline its heliocentric orbit by ~5 degrees toward the Main Asteroid Belt.',
      'Captured multi-band framing camera and VIR spectrometer calibration spectra of southern Martian highlands.',
      'Demonstrated long-duration xenon ion cruising later adapted for Psyche and planetary defense probes.',
    ],
    modelDisclaimer:
      'Displays the verified NASA Dawn GLB asset; orbital flyby track rendered in scene is scaled for legibility.',
  },

  near_shoemaker: {
    id: 'near_shoemaker',
    agencyAndProgram: 'NASA / APL · Near Earth Asteroid Rendezvous (Discovery 1)',
    era: 'Launched Feb 17, 1996 · Reference Deep-Space Spacecraft in Atlas',
    biography:
      'The first spacecraft to orbit and softly touch down on an asteroid (433 Eros). Included here as a verified NASA APL deep-space spacecraft geometry reference.',
    technicalSpecs: [
      { label: 'Dry Mass', value: '487 kg · octagonal aluminum bus' },
      { label: 'Power System', value: '4 GaAs fixed solar paddles (~400 W at 2.2 AU)' },
      { label: 'Instruments', value: 'MSI camera, NIS IR spectrometer, XGRS, NLR laser rangefinder, MAG' },
    ],
    measuredData: [
      { label: 'Mission Duration', value: '5 years active (1996–2001) · 1 year in orbit around 433 Eros' },
      { label: 'Touchdown Velocity', value: '~1.5–1.8 m/s final soft impact on Eros surface (Feb 12, 2001)' },
    ],
    contributions: [
      'Collected >160,000 high-resolution surface images and complete laser altimetry shape models of asteroid 433 Eros.',
      'Confirmed primitive chondritic elemental ratios directly linking S-type asteroids to ordinary chondrite meteorites.',
    ],
    modelDisclaimer:
      'Included as a verified NASA reference 3D GLB from the local spacecraft archive; NEAR did not land on Mars.',
  },

  pioneer_10: {
    id: 'pioneer_10',
    agencyAndProgram: 'NASA / Ames Research Center · Outer Planets Pioneer Program',
    era: 'Launched Mar 3, 1972 · Deep-Space Cruise Reference Model',
    biography:
      'Humanity’s first spacecraft to cross the Asteroid Belt and fly past Jupiter; carried the famous anodized gold-aluminum Pioneer plaque into the outer heliosphere.',
    technicalSpecs: [
      { label: 'Launch Mass', value: '258 kg · spin-stabilized at 4.8 RPM' },
      { label: 'High-Gain Dish', value: '2.74 m parabolic reflector' },
      { label: 'Power System', value: '4× SNAP-19 Pu-238 RTGs on twin radial trusses (~155 W launch)' },
    ],
    measuredData: [
      { label: 'Last Weak Signal', value: 'Jan 23, 2003 at 12.2 billion km (~82 AU from Earth)' },
      { label: 'Jupiter Flyby', value: '132,252 km cloud-top closest approach (Dec 1973)' },
    ],
    contributions: [
      'Demonstrated safe passage through micrometeoroid zones beyond Mars orbit and intense Jovian radiation belts.',
      'Provided outer Solar System solar-wind, cosmic-ray, and Doppler anomalous-acceleration tracking baselines.',
    ],
    modelDisclaimer:
      'Included as a verified NASA deep-space GLB reference in the Atlas collection; Pioneer 10 is an outer-planet flyby probe.',
  },

  kepler_space_telescope: {
    id: 'kepler_space_telescope',
    agencyAndProgram: 'NASA / Ames & Ball Aerospace · Discovery Mission 10',
    era: 'Launched Mar 7, 2009 · Retired Nov 2018 (Heliocentric Earth-trailing orbit)',
    biography:
      'Space photometer observatory built to determine the occurrence rate of Earth-sized exoplanets inside or near stellar habitable zones via high-precision transit photometry.',
    technicalSpecs: [
      { label: 'Launch Mass', value: '1,052 kg · 0.95 m aperture Schmidt photometer (1.4 m mirror)' },
      { label: 'Focal Plane', value: '42 CCD mosaic · 95-megapixel curved focal surface' },
      { label: 'Orbit', value: 'Earth-trailing heliocentric ~372.5-day solar orbit' },
    ],
    measuredData: [
      { label: 'Stars Monitored', value: '>530,000 stars across primary + K2 campaigns' },
      { label: 'Confirmed Planets', value: '2,700+ confirmed exoplanets discovered (>3,000 candidates)' },
    ],
    contributions: [
      'Demonstrated statistically that small rocky planets outnumber stars in the Milky Way galaxy.',
      'Uncovered ultra-compact multi-planet resonant systems, circumbinary worlds, and sub-Neptune radius valley physics.',
    ],
    modelDisclaimer:
      'Displays the verified NASA Kepler GLB file as an engineering reference asset alongside planetary missions.',
  },

  mro_orbiter: {
    id: 'mro_orbiter',
    agencyAndProgram: 'NASA / JPL & Lockheed Martin · Mars Reconnaissance Orbiter',
    era: 'Launched Aug 12, 2005 · In Mars Polar Orbit Since Mar 10, 2006 (Active)',
    biography:
      'Mars’s premier high-resolution remote-sensing eye and deep-space communications relay, operating in a sun-synchronous 255 × 320 km near-polar mapping orbit.',
    technicalSpecs: [
      { label: 'Dry / Wet Mass', value: '1,031 kg dry · 2,180 kg launch mass' },
      { label: 'Optics & Radar', value: 'HiRISE (0.5 m telescope, 0.3 m/px), CTX, CRISM, SHARAD, MCS' },
      { label: 'High-Gain Dish', value: '3.0 m parabolic Ka/X-band UHF/DSN relay antenna' },
      { label: 'Solar Arrays', value: 'Dual 5.3 × 2.5 m tracking wings (~2,000 W in Mars orbit)' },
    ],
    measuredData: [
      { label: 'Data Returned', value: '>450 terabits (>100,000 HiRISE targeted stereopairs & images)' },
      { label: 'Subsurface Ice', value: 'SHARAD radar mapped km-thick mid-latitude glaciers & layered polar ice' },
      { label: 'Landing Support', value: 'Verified landing safety & live EDL telemetry for Phoenix, Curiosity, InSight, Perseverance' },
    ],
    contributions: [
      'Identified phyllosilicate clays, hydrated sulfates, chlorides, and silica terraces guiding every modern Mars landing site selection.',
      'Detected active Martian surface change in real time: fresh impact craters excavating pure water ice, migrating sand dunes, and CO₂ ice geysers.',
      'Serves as the critical primary UHF data relay between surface landers/rovers and NASA Deep Space Network.',
    ],
    modelDisclaimer:
      'Displays the verified NASA MRO GLB during Model Close-Up; orbital path and cupola POV are illustrative.',
  },

  curiosity_rover: {
    id: 'curiosity_rover',
    agencyAndProgram: 'NASA / JPL · Mars Science Laboratory (MSL)',
    era: 'Launched Nov 26, 2011 · Landed Gale Crater Aug 6, 2012 (Active >4,300 sols)',
    biography:
      'A car-sized nuclear-powered analytical laboratory exploring Gale Crater and climbing the 5.5 km layered sediments of Aeolis Mons (Mount Sharp) to reconstruct ancient habitability.',
    technicalSpecs: [
      { label: 'Rover Mass', value: '899 kg (incl. 75 kg scientific instrument payload)' },
      { label: 'Power System', value: 'MMRTG Pu-238 radioisotope generator (~110 W at landing)' },
      { label: 'Mobility / Arm', value: '6× 0.50 m machined Al wheels · 2.1 m 5-DOF rotary percussive drill arm' },
      { label: 'Payload (10)', value: 'Mastcam, ChemCam (LIBS), MAHLI, MARDI, APXS, CheMin, SAM, RAD, DAN, REMS' },
    ],
    measuredData: [
      { label: 'Traverse / Climb', value: '>33 km driven · >800 m vertical ascent up Mount Sharp strata' },
      { label: 'Habitability Finding', value: 'Neutral pH ancient lakebeds at Yellowknife Bay with C, H, N, O, P, S' },
      { label: 'Organics & Methane', value: 'Indigenous thiophenes & chlorobenzene organics; seasonal CH₄ ~0.2–0.7 ppbv + spikes' },
    ],
    contributions: [
      'Achieved MSL’s core goal within months: proved Gale Crater once held long-lived habitable freshwater lakes and groundwater systems.',
      'Discovered bedrock clay-to-sulfate transitions recording Mars’s planetary drying over 3.5+ billion years.',
      'Pioneered sky-crane pinpoint EDL precision and measured surface radiation (RAD) essential for future human Mars mission planning.',
    ],
    modelDisclaimer:
      'Rendered from the official NASA/JPL-Caltech Curiosity GLB (24584_Curiosity_static.glb). Geometry is a single static mesh without articulated joints; physical metric CAD dimensions and live kinematics are illustrative.',
  },

  perseverance_rover: {
    id: 'perseverance_rover',
    agencyAndProgram: 'NASA / JPL · Mars 2020 Mission',
    era: 'Launched Jul 30, 2020 · Landed Jezero Crater Feb 18, 2021 (Active)',
    biography:
      'Mars’s flagship astrobiology and sample-caching rover exploring an ancient river delta inside Jezero Crater while preparing hermetically sealed cores for future Mars Sample Return.',
    technicalSpecs: [
      { label: 'Rover Mass', value: '1,025 kg · strengthened thick-tread curved-grouser aluminum wheels' },
      { label: 'Power System', value: 'MMRTG Pu-238 (~110 W electric + waste heat fluid loop)' },
      { label: 'Payload (7)', value: 'Mastcam-Z, SuperCam, PIXL, SHERLOC, RIMFAX, MEDA, MOXIE' },
      { label: 'Sample Caching', value: 'Rotary-percussive coring turret + Adaptive Caching Assembly (43 tubes)' },
    ],
    measuredData: [
      { label: 'Samples Sealed', value: '24+ igneous, delta mudstone, and carbonate cores + 10-tube Three Forks depot' },
      { label: 'MOXIE Oxygen', value: '122 g O₂ produced from CO₂ atmosphere at ~98% purity across 16 runs' },
      { label: 'RIMFAX Radar', value: 'Imaged dipping delta foreset beds down to ~15–20 m beneath Jezero floor' },
    ],
    contributions: [
      'Built the first extraterrestrial cached sample depot and confirmed basaltic-olivine magma floor overlain by lacustrine/deltaic carbonate sediments.',
      'Operated MOXIE, proving in-situ resource utilization (ISRU) oxygen generation from Martian CO₂ for future ascent rockets and crew life support.',
      'Deployed Ingenuity helicopter and recorded the first direct microphones audio of Martian winds, laser sparks, and rover wheels.',
    ],
    modelDisclaimer:
      'Rendered from the official NASA/JPL-Caltech Perseverance GLB (25042_Perseverance.glb, 66 hardware nodes). Subsystem highlighting and camera views reflect the NASA mesh hierarchy; telemetry and Control Room POV imagery are illustrative.',
  },

  apollo_lrv: {
    id: 'apollo_lrv',
    agencyAndProgram: 'NASA MSFC · Boeing / Delco Electronics · Apollo J-Missions',
    era: 'Operated on Apollo 15 (1971), Apollo 16 (1972) & Apollo 17 (1972)',
    biography:
      'An electric, collapsible 4×4 lunar dune buggy stowed in Quadrant 1 of the Apollo Lunar Module Descent Stage that multiplied astronauts’ geological exploration range on the Moon.',
    technicalSpecs: [
      { label: 'Empty Mass', value: '210 kg Earth weight (~34.5 kg lunar weight · 490 kg payload capacity)' },
      { label: 'Dimensions', value: '3.1 m length × 2.06 m width × 2.3 m wheelbase' },
      { label: 'Traction & Tires', value: '4 × 0.25 hp (186 W) DC hub motors · piano-wire zinc-coated mesh wheels' },
      { label: 'Power & Nav', value: 'Two 36 V AgZn primary batteries (121 Ah each) · gyro dead-reckoning' },
    ],
    measuredData: [
      { label: 'Combined Mileage', value: '90.6 km total driven across Apollo 15, 16, and 17' },
      { label: 'Top Lunar Speed', value: '18.0 km/h (recorded downhill during Apollo 17 by Gene Cernan)' },
      { label: 'Grade Climbing', value: 'Sustained climbs up 20–25° dusty regolith slopes' },
    ],
    contributions: [
      'Transformed Apollo from local LM-vicinity walks into regional multi-kilometer geological field expeditions.',
      'Carried 286+ kg total of Apollo 15/16/17 documented lunar rock cores, orange glass beads, and anorthosite samples.',
      'Demonstrated wire-mesh elastic wheel traction and passive multi-layer thermal control on vacuum regolith.',
    ],
    modelDisclaimer:
      'No official Apollo LRV `.glb` exists in the repository; rendered via an interactive procedural 3D spaceframe & LCRU assembly.',
  },

  apollo_lrv_deployment: {
    id: 'apollo_lrv_deployment',
    agencyAndProgram: 'NASA MSC / NTRS · LRV Quadrant 1 Deployment Assembly',
    era: 'Apollo 15, 16 & 17 LM Descent Stage Unfolding Sequence',
    biography:
      'Ingenious spring-assisted, lanyard-deployed folding mechanism allowing two pressure-suited astronauts to pull, unfold, and lock a full 3.1 m vehicle from a wedge bay in ~20 minutes.',
    technicalSpecs: [
      { label: 'Stowed Envelope', value: 'Tri-folded hinged aluminum chassis packed inside LM Quadrant 1' },
      { label: 'Actuation', value: 'Crew-pulled nylon tapes, torsion bars, damping reels & locking pins' },
      { label: 'Sub-Frames', value: 'Center load bay + folding aft engine/palette + folding forward suspension' },
    ],
    measuredData: [
      { label: 'Deployment Time', value: '~18–25 minutes EVA crew procedure from LM Quadrant 1 release' },
      { label: 'Clearance Angle', value: '~45–60° tilt-out arc prior to wheel deployment onto lunar surface' },
    ],
    contributions: [
      'Solved severe Apollo mass and volume constraints without hydraulic actuators or ground cranes.',
      'Validated cold-vacuum mechanical latch reliability across extreme +120 °C sunlit storage gradients.',
    ],
    modelDisclaimer:
      'Illustrative 3D procedural deployment-pose model derived from NASA NTRS LRV Systems & Deployment manuals; zero `.glb` files loaded.',
  },

  apollo_15_lrv: {
    id: 'apollo_15_lrv',
    agencyAndProgram: 'NASA · Apollo 15 (LRV-1) · Hadley-Apennine Site',
    era: 'Deployed Jul 31, 1971 · Crew: David Scott & James Irwin',
    biography:
      'The inaugural Lunar Roving Vehicle (LRV-1), carrying astronauts to the sinuous walls of Hadley Rille and the Apennine foothills including the discovery of the "Genesis Rock" anorthosite.',
    technicalSpecs: [
      { label: 'Vehicle ID', value: 'LRV-1 · Front-wheel steering only after forward steering fault' },
      { label: 'Battery Capacity', value: 'Two 36 V, 121 Ah non-rechargeable AgZn cells (~4.3 kWh each)' },
      { label: 'Broadcast Comms', value: 'Earth-aimed high-gain parabolic dish + color LCRU TV camera' },
    ],
    measuredData: [
      { label: 'Traverse Distance', value: '27.9 km across 3 EVAs (~3 h 02 m driving time)' },
      { label: 'Max Range from LM', value: '5.0 km radial excursion to Spur Crater & Hadley Rille rim' },
      { label: 'Samples Returned', value: '77 kg of lunar rocks including #15415 anorthosite ("Genesis Rock")' },
    ],
    contributions: [
      'Collected sample 15415 ferroan anorthosite (~4.1+ billion years old), foundational evidence for the Lunar Magma Ocean hypothesis.',
      'Broadcast live high-resolution geological traverse video controlled remotely from Houston Mission Control.',
    ],
    modelDisclaimer:
      'Illustrative procedural 3D hardware assembly based on NASA Apollo 15 Press Kit & Operations Handbook; no `.glb` model bundled.',
  },

  apollo_17_lrv: {
    id: 'apollo_17_lrv',
    agencyAndProgram: 'NASA · Apollo 17 (LRV-3) · Taurus-Littrow Valley',
    era: 'Operated Dec 11–14, 1972 · Crew: Eugene Cernan & Harrison Schmitt',
    biography:
      'The final and longest-range Apollo rover traverse, carrying astronaut-geologist Harrison Schmitt across Shorty Crater, North/South Massifs, and deep valley floor boulder fields.',
    technicalSpecs: [
      { label: 'Vehicle ID', value: 'LRV-3 · Iconic taped-map fender repair after right-aft fender damage' },
      { label: 'Field Equipment', value: 'Traverse Gravimeter Experiment (TGE), Surface Electrical Properties (SEP), 78-cm magnetometer/drill rack' },
      { label: 'Power Used', value: 'Only ~48 Ah of 242 Ah total dual-battery capacity consumed' },
    ],
    measuredData: [
      { label: 'Traverse Distance', value: '35.9 km across 3 EVAs (~4 h 26 m driving time · Apollo record)' },
      { label: 'Max Range from LM', value: '7.6 km radial walk-back safety limit distance' },
      { label: 'Samples Returned', value: '110.5 kg total lunar rock/soil incl. #74220 pyroclastic orange glass' },
    ],
    contributions: [
      'Discovered pyroclastic orange volcanic glass beads at Shorty Crater (~3.64 Ga), revealing volatile-rich deep lunar mantle reservoirs.',
      'Demonstrated improvised regolith-dust abatement using laminated lunar maps and clamps, later preserving rover electronics.',
    ],
    modelDisclaimer:
      'Illustrative procedural 3D LRV assembly mapped from NASA Apollo 17 Press Kit & Operations Handbook; zero GLB requests.',
  },

  apollo_surface_equipment: {
    id: 'apollo_surface_equipment',
    agencyAndProgram: 'NASA MSC · Modularized Equipment Transporter (MET) & Surface Science',
    era: 'Apollo 14 (Feb 1971) & ALSEP / Traverse Hardware Suite',
    biography:
      'Two-wheeled, nitrogen-rubber-tired astronaut handcart and geological tool carrier that preceded the LRV on Apollo 14, alongside deployable ALSEP geophysical stations.',
    technicalSpecs: [
      { label: 'MET Structure', value: '12.5 kg aluminum frame cart with 4-inch wide soft Goodyear XLR tires' },
      { label: 'Payload Bay', value: 'Carried Hasselblad cameras, 35-mm stereo close-up cam, thumper/geophone, magnetometer' },
    ],
    measuredData: [
      { label: 'Cone Crater Climb', value: '~2.9 km Apollo 14 EVA-2 hike toward Cone Crater boulder rim' },
      { label: 'ALSEP Lifespan', value: 'Apollo 12–17 ALSEP nuclear stations returned seismic/laser data until Sep 1977' },
    ],
    contributions: [
      'Enabled Apollo 14 to haul 42.3 kg of Imbrium basin ejecta samples back from steep Cone Crater slopes.',
      'Validated wide-footprint tire flotation and portable magnetometer traverses prior to wheeled electric LRV operations.',
    ],
    modelDisclaimer:
      'Illustrative procedural 3D reconstruction of Apollo surface hardware when no official NASA GLB asset exists.',
  },

  apollo_lm_equipment: {
    id: 'apollo_lm_equipment',
    agencyAndProgram: 'NASA / Grumman · Lunar Module MESA (Quadrant 4 Stowage)',
    era: 'All Six Crewed Apollo Landings (Apollo 11–17, 1969–1972)',
    biography:
      'Hinged drop-down stowage table built into Quadrant 4 of every Apollo Lunar Module Descent Stage, holding the historic Westinghouse slow-scan TV camera, solar wind foil, and rock boxes.',
    technicalSpecs: [
      { label: 'Mount Bay', value: 'LM Descent Stage Quadrant 4 · cable-released fold-out workbench' },
      { label: 'Primary Cargo', value: 'Westinghouse/RCA lunar TV camera, two SRC rock sample boxes, Contingency Sampler' },
    ],
    measuredData: [
      { label: 'Historic First', value: 'Broadcast Apollo 11 Neil Armstrong first ladder steps on Jul 20, 1969 (~600M+ viewers)' },
      { label: 'Sample Sealing', value: 'Indium knife-edge vacuum SRC containers preserved pristine regolith chemistry' },
    ],
    contributions: [
      'Delivered humanity’s first live television broadcast from another celestial world directly from its hinged bracket.',
      'Organized vacuum-tight rock return canisters and Solar Wind Composition (SWC) collector foil across all 6 landings.',
    ],
    modelDisclaimer:
      'Illustrative procedural 3D representation of the LM MESA fold-out platform; no `.glb` assets are fetched.',
  },

  phobos: {
    id: 'phobos',
    agencyAndProgram: 'IAU / NASA Mars Reconnaissance & Viking/Express Observations',
    era: 'Discovered Aug 18, 1877 (Asaph Hall) · Target of JAXA MMX Sample Return',
    biography:
      'The larger and innermost of Mars’s two natural moons, orbiting below synchronous altitude so fast it rises in the west and sets in the east twice every Martian sol.',
    technicalSpecs: [
      { label: 'Dimensions', value: '26.8 × 22.4 × 18.4 km triaxial ellipsoid (~11.27 km mean radius)' },
      { label: 'Semi-Major Axis', value: '9,376 km from Mars center (~5,989 km above Martian surface)' },
      { label: 'Orbital Period', value: '7 h 39 m 12 s · Eccentricity 0.0151 · Inclination 1.093°' },
    ],
    measuredData: [
      { label: 'Bulk Density', value: '1.86 g/cm³ (implies ~25–35% internal porosity / rubble-pile structure)' },
      { label: 'Secular Decay', value: '~1.8 cm/year inward spiral due to Martian tidal dissipation' },
      { label: 'Major Landmark', value: 'Stickney Crater (~9 km wide · ~40% of moon diameter)' },
    ],
    contributions: [
      'Constrained tidal dissipation parameters of Mars’s interior mantle through precise astrometric decay measurements.',
      'High-albedo/spectral similarity to D/T-type outer-belt carbonaceous bodies fuels debate between captured asteroid vs giant-impact origins.',
    ],
    modelDisclaimer:
      'Orbital and close-up views render the official NASA 3D Resources Phobos GLB (`24878_Phobos_1_1000.glb`), scaled on orbit for legibility alongside documented Keplerian parameters.',
  },

  deimos: {
    id: 'deimos',
    agencyAndProgram: 'IAU / NASA & ESA Mars Express / Emirates Hope Flybys',
    era: 'Discovered Aug 12, 1877 (Asaph Hall)',
    biography:
      'Mars’s smaller, smoother outer moon covered in an unusually thick blanket of fine regolith that softens its impact craters in a slow ~30.3-hour prograde orbit.',
    technicalSpecs: [
      { label: 'Dimensions', value: '15.0 × 12.2 × 10.4 km triaxial (~6.2 km mean radius)' },
      { label: 'Semi-Major Axis', value: '23,463.2 km (~20,069 km above Mars equator)' },
      { label: 'Orbital Period', value: '30 h 18 m · Escape velocity ~5.6 m/s (12 mph)' },
    ],
    measuredData: [
      { label: 'Bulk Density', value: '1.471 g/cm³ · Bond albedo 0.068 (dark carbonaceous surface)' },
      { label: 'Surface Temp', value: 'Mean ~233 K (-40 °C) · Max sunlight up to ~290 K' },
    ],
    contributions: [
      'Near-circular equatorial orbit makes Deimos a sensitive dynamical tracer against pure stochastic asteroid capture scenarios.',
      'Emirates Hope 2023 close flybys revealed basaltic-like spectral similarities linking Deimos more closely to Martian crust origins.',
    ],
    modelDisclaimer:
      'Orbital and close-up views render the official NASA 3D Resources Deimos GLB (`24879_Deimos_1_1000.glb`), scaled for orbital visibility alongside documented Keplerian parameters.',
  },

  mars_odyssey: {
    id: 'mars_odyssey',
    agencyAndProgram: 'NASA / JPL & Lockheed Martin · Mars Surveyor 2001 Program',
    era: 'Launched Apr 7, 2001 · Mars Orbit Since Oct 24, 2001 (Longest-serving Mars probe)',
    biography:
      'The longest-operating spacecraft in Martian history, continuously mapping mineral thermophysics, hydrogen water-ice distribution, and relaying surface rover communications.',
    technicalSpecs: [
      { label: 'Wet / Dry Mass', value: '725 kg launch · 376 kg dry mass · 5.7 m solar wing' },
      { label: 'Mapping Orbit', value: '~400 km sun-synchronous near-polar orbit (Inclination 93.1°)' },
      { label: 'Instruments', value: 'THEMIS (vis/IR imager), GRS (Gamma Ray + HEND neutron spectrometers), MARIE' },
    ],
    measuredData: [
      { label: 'Subsurface Ice', value: 'GRS/HEND discovered vast shallow H₂O ice within top ~1 m poleward of ±60° lat' },
      { label: 'Thermal Maps', value: 'Global 100 m/px daytime/nighttime thermal inertia & chloride/olivine mineral maps' },
    ],
    contributions: [
      'Made the landmark discovery of widespread subsurface water ice across Martian high latitudes, directly leading to the 2008 Phoenix polar lander.',
      'Provided essential UHF data relay for Spirit, Opportunity, Phoenix, and early Curiosity operations.',
    ],
    modelDisclaimer:
      'Renders the official NASA 3D Resources 2001 Mars Odyssey GLB (`24885_Odyssey.glb`) directly along its Keplerian orbital track and in Option 1 3D Close-Up.',
  },

  maven_orbiter: {
    id: 'maven_orbiter',
    agencyAndProgram: 'NASA / GSFC & CU Boulder LASP · Mars Scout Program',
    era: 'Launched Nov 18, 2013 · Entered Elliptical Mars Orbit Sep 21, 2014 (Active)',
    biography:
      'Upper-atmosphere aeronomy orbiter built specifically to measure how solar wind, ultraviolet radiation, and solar storms strip away Mars’s ancient thick atmosphere into space.',
    technicalSpecs: [
      { label: 'Dry / Launch Mass', value: '809 kg dry · 2,454 kg launch · 11.4 m wing-to-wing' },
      { label: 'Science Orbit', value: 'Elliptical ~150 × 6,200 km (~4.5 h period, ~75° inclination)' },
      { label: 'Instruments', value: 'NGIMS, IUVS, MAG, SWEA, SWIA, STATIC, SEP, LPW, EUV' },
    ],
    measuredData: [
      { label: 'Escape Flux', value: '~100+ g/s quiet baseline; jumps 10–20× during Interplanetary CMEs' },
      { label: 'Isotope Ratio', value: '³⁸Ar/³⁶Ar & D/H enrichment confirms ~66%+ of early atmosphere lost to space' },
    ],
    contributions: [
      'Solved the core mystery of Martian climate evolution: proved solar wind sputtering and photochemical escape dried out ancient Mars.',
      'Discovered global diffuse proton auroras, dust-storm lifted water vapor escaping high into the exosphere, and UHF relay redundancy.',
    ],
    modelDisclaimer:
      'Renders the official NASA 3D Resources MAVEN GLB (`24882_Maven.glb`) along its elliptical upper-atmosphere orbit and in Option 1 3D Close-Up.',
  },

  dawn_flyby: {
    id: 'dawn_flyby',
    agencyAndProgram: 'NASA / JPL · Discovery 9 (2009 Gravity Assist Trajectory)',
    era: 'Mars Closest Approach Feb 17, 2009 at ~549 km altitude',
    biography:
      'Orbital trajectory node commemorating Dawn’s precision unpowered Mars flyby in February 2009 on its journey from Earth to Vesta and Ceres.',
    technicalSpecs: [
      { label: 'Flyby Altitude', value: '549 km above Mars surface' },
      { label: 'Heliocentric Turn', value: '~5.0° orbital inclination change + Vesta transfer boost' },
    ],
    measuredData: [
      { label: 'Checkouts', value: 'Framing Camera, VIR IR & GRaND radiation sensors calibrated on Mars' },
    ],
    contributions: [
      'Proved low-thrust xenon ion interplanetary transfers can seamlessly pair with planetary gravity assists.',
    ],
    modelDisclaimer:
      'Renders the official NASA `dawn_spacecraft.glb` model directly along its illustrative orbital flyby loop and in Option 1 3D Close-Up.',
  },

  ares_station: {
    id: 'ares_station',
    agencyAndProgram: 'Illustrative Orbital Concept · Atlas Research Benchmark (Fictional)',
    era: 'Unflown Concept Architecture (Not an active or funded NASA spacecraft)',
    biography:
      'A purely illustrative artificial-gravity & Mars Gateway concept included to benchmark large orbital structures and cupola Control Room views.',
    technicalSpecs: [
      { label: 'Conceptual Alt', value: '~5,200 km equatorial parking reference (~1,810 km above surface scaled)' },
      { label: '3D Structural Proxy', value: 'Official NASA ISS truss & pressurized module assembly GLB (`International Space Station (ISS) (B).glb`)' },
    ],
    measuredData: [
      { label: 'Measurement Status', value: 'None — conceptual visualization baseline with no measured Martian telemetry' },
    ],
    contributions: [
      'Demonstrates human-scale Mars orbital logistics and cupola POV orientation controls without claiming real flight heritage.',
    ],
    modelDisclaimer:
      'Conceptual gateway node — renders the official NASA 3D Resources International Space Station GLB as a realistic structural proxy; clearly separated from flown Martian missions.',
  },

  lro_orbiter: {
    id: 'lro_orbiter',
    agencyAndProgram: 'NASA / GSFC · Lunar Reconnaissance Orbiter',
    era: 'Launched Jun 18, 2009 · In Polar Lunar Orbit Since Jun 23, 2009 (Active)',
    biography:
      'The highest-precision cartographic and polar volatile orbiter ever sent to the Moon, mapping landing sites, sunlit peaks, and permanently shadowed cold traps ahead of Artemis.',
    technicalSpecs: [
      { label: 'Dry / Launch Mass', value: '1,916 kg wet · 50 × 50 km polar mapping orbit (89.2° incl.)' },
      { label: 'Instruments', value: 'LOLA, LROC (0.5 m NAC), Diviner, LAMP, LEND, Mini-RF, CRaTER' },
    ],
    measuredData: [
      { label: 'Coldest Spot', value: '<35 K (-238 °C) measured in Hermite/Shoemaker permanently shadowed craters' },
      { label: 'LROC Resolution', value: '0.5 m/pixel imaging resolving Apollo LM descent stages, LRVs & foot tracks' },
      { label: 'Topography', value: '>7 billion LOLA laser altimetry points globally (<10 cm vertical precision)' },
    ],
    contributions: [
      'Re-photographed every Apollo landing site and Soviet Lunokhod rover directly from lunar orbit.',
      'Delivered the global 3D topographic and hydrogen-neutron baseline guiding Artemis III lunar south pole site selection.',
    ],
    modelDisclaimer:
      'Renders the official NASA 3D Resources Lunar Reconnaissance Orbiter GLB (`Lunar Reconnaissance Orbiter (B).glb`) in polar lunar orbit and Option 1 3D Close-Up (surface Apollo hardware remains separate and unmodeled).',
  },

  apollo_csm: {
    id: 'apollo_csm',
    agencyAndProgram: 'NASA MSC / North American Rockwell · Apollo Block II CSM',
    era: 'Apollo 8, 10–17 & Skylab/ASTP (1968–1975)',
    biography:
      'Orbital mothership piloted solo by the Command Module Pilot in a ~110 km lunar parking orbit while two crewmates explored the Moon below, hosting orbital J-mission SIM bay science.',
    technicalSpecs: [
      { label: 'Stacked Mass', value: '~28,800–30,320 kg wet (CM 5,560 kg + SM ~24,500 kg)' },
      { label: 'Main Engine', value: 'Aerojet AJ10-137 SPS (91.2 kN hypergolic TEI escape engine)' },
      { label: 'Power System', value: '3× Pratt & Whitney H₂-O₂ fuel cells' },
    ],
    measuredData: [
      { label: 'Parking Orbit', value: '~110 km altitude (~1.97 h period) · Inclinations up to 28°' },
      { label: 'SIM Bay Suite', value: 'Apollo 15–17 panoramic/metric mapping cameras, laser altimeter, X-ray/alpha/gamma spectrometers' },
    ],
    contributions: [
      'Safely returned 382 kg of lunar rocks and 24 astronauts across nine trans-lunar journeys.',
      'Conducted the first comprehensive geochemical orbital mapping of highlands vs maria thorium, KREEP, and aluminum/silicon ratios.',
    ],
    modelDisclaimer:
      'Uses the official NASA 3D Resources Apollo-Soyuz orbital spacecraft GLB (`Apollo Soyuz.glb`, Block II CSM + docking module) as the orbital CSM structural reference on orbit and in Option 1 Close-Up; surface Apollo LM/LRV hardware remains unavailable.',
  },
};

export function getDossierById(id: string | null | undefined): DeviceDossier | null {
  if (!id) return null;
  return DEVICE_DOSSIERS[id] ?? null;
}
