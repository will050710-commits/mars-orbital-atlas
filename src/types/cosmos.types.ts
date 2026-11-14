import type * as THREE from 'three';

export type SpectralMode =
  | 'VISUAL_RGB'
  | 'THERMAL_IR'
  | 'MOLA_ELEVATION'
  | 'TERRAIN_MESH_3D';

export type InspectionViewMode = 'MODEL_CLOSEUP' | 'CONTROL_ROOM_POV';

export type SensorFilterMode =
  | 'OPTICAL_RGB'
  | 'NAVCAM_MONO'
  | 'ELEVATION_GRID'
  | 'THERMAL_FALSE';

export type ProceduralModelKind =
  | 'mars_rover_rtg'
  | 'apollo_lrv'
  | 'apollo_lrv_deploy'
  | 'apollo_surface_pack'
  | 'apollo_lm_mesa';

export type ViewStage =
  | 'PRELOADING'
  | 'LAUNCHING'
  | 'ORBITAL_OVERVIEW'
  | 'WARPING'
  | 'SUB_SCENE'
  | 'SURFACE_CESIUM';

export type CelestialTargetId = string;

export type LegacyCelestialTargetId =
  | 'mars'
  | 'phobos'
  | 'deimos'
  | 'mro_orbiter'
  | 'ares_station'
  | 'olympus_mons'
  | 'valles_marineris'
  | 'jezero_crater'
  | 'hellas_planitia'
  | 'gale_crater';

export type CelestialCategory = 'PLANET' | 'MOON' | 'SPACECRAFT' | 'SURFACE_POI';

export interface SurfaceCoordinates {
  lat: number;
  lon: number;
  height: number;
  elevationKm?: number;
}

export interface OrbitalElements {
  semiMajorAxisKm: number;
  eccentricity: number;
  inclinationDeg: number;
  ascendingNodeDeg: number;
  argumentOfPeriapsisDeg: number;
  meanAnomalyAtEpochDeg: number;
  orbitalPeriodHours: number;
}

export interface ScientificTelemetry {
  classification: string;
  meanTemperatureC: string;
  atmosphericPressurePa: string;
  surfaceGravityMs2: string;
  orbitalVelocityKms: string;
  geologicalAge: string;
  missionSummary: string;
  keyHighlights: string[];
}

export interface CelestialTarget {
  id: CelestialTargetId;
  name: string;
  subtitle: string;
  category: CelestialCategory;
  position: THREE.Vector3;
  radius: number;
  safeViewDistance: number;
  isSurfaceLanding?: boolean;
  coordinates?: SurfaceCoordinates;
  orbitalElements?: OrbitalElements;
  modelPath?: string;
  telemetry: ScientificTelemetry;
  bodyId?: BodyId;
  source?: SourceReference;
}

export type BodyId = 'mars' | 'moon';

export interface SourceReference {
  title: string;
  url: string;
  checked: string;
  version: string;
}

export interface BodyConfig {
  id: BodyId;
  name: string;
  radiusKm: number;
  rotationSeconds: number;
  color: string;
  textureStyle: 'illustrative-mars' | 'illustrative-moon' | 'plain';
  source: SourceReference;
  target: CelestialTarget;
  layers: { id: string; label: string; status: 'illustrative' | 'unavailable'; detail: string }[];
}

export interface DeviceRecord {
  id: string;
  bodyId: BodyId;
  name: string;
  kind: string;
  summary: string;
  evidence: string;
  source: SourceReference;
  status: 'available' | 'unavailable';
  modelPath?: string;
  bytes?: number;
  sha256?: string;
  credit: string;
  license: { label: string; url: string; checked: string };
  /** Optional preserved attribution/provenance file for an available asset. */
  attributionPath?: string;
  /** Optional procedural reconstruction kind when no original GLB file is available. */
  proceduralModel?: ProceduralModelKind;
  /** Optional landing/deployment coordinates on the parent celestial body (deg). */
  coordinates?: { lat: number; lon: number };
  units: string;
  transform: { rotation: [number, number, number]; normalization: 'fit-longest-side-2'; physicalScaleVerified: false };
  version: string;
}

export interface LODTierConfig {
  level: 0 | 1 | 2 | 3;
  maxDistanceKm: number;
  segments: number;
  label: string;
}

export type DeviceCameraViewId =
  | 'overview'
  | 'coaxial_mast'
  | 'rte_horizon'
  | 'navcam_nadir'
  | 'arm_grapple'
  | 'solar_wings'
  | 'deck_overview'
  | 'mast_optics'
  | 'wheel_bogie'
  | 'rtg_aft'
  | 'dish_high_gain'
  | 'nav_console'
  | 'mesa_bay';

export type DevicePartGroupId =
  | 'all'
  | 'rotor_system'
  | 'solar_power'
  | 'fuselage_avionics'
  | 'cameras_optics'
  | 'landing_gear'
  | 'robotic_arm'
  | 'grapple_claw'
  | 'solar_wings'
  | 'lander_deck'
  | 'optics_mast'
  | 'mobility_chassis'
  | 'power_thermal'
  | 'payload_science';

export type RotorSpinMode = 'stopped' | 'demo_slow';

export type RotorStepDeg = 0 | 45 | 90 | 180;

export interface DeviceCameraViewSpec {
  id: DeviceCameraViewId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  summary: string;
  sourceRef: string;
  isIllustrativeView: true;
}

export interface DevicePartGroupSpec {
  id: DevicePartGroupId;
  label: string;
  nodeNames: string[];
  documentedSpec: string;
  sourceRef: string;
  limitationNote: string;
  isControlVerified: boolean;
}

export interface DeviceRotorControlSpec {
  upperNodeName: string;
  lowerNodeName: string;
  localAxis: [number, number, number];
  documentedRpm: string;
  documentedDiameter: string;
  documentedFlightWindow: string;
  demoSpinRadPerSec: number;
  demoRevPerSecLabel: string;
  stepAnglesDeg: RotorStepDeg[];
  disclaimer: string;
}

export interface DeviceControlSpec {
  deviceId: string;
  modelVersion: string;
  generalDisclaimer: string;
  rotorControl?: DeviceRotorControlSpec;
  cameraViews: DeviceCameraViewSpec[];
  partGroups: DevicePartGroupSpec[];
  sources: SourceReference[];
}
