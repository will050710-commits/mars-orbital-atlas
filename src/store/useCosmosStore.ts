import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';
import { BODY_CATALOG } from '../config/bodyCatalog';
import { DEVICE_CATALOG } from '../config/deviceCatalog';
import type {
  CelestialTarget,
  CelestialTargetId,
  SpectralMode,
  ViewStage,
  BodyId,
  DeviceCameraViewId,
  DevicePartGroupId,
  RotorSpinMode,
  RotorStepDeg,
  InspectionViewMode,
  SensorFilterMode,
} from '../types/cosmos.types';

export type {
  CelestialTarget,
  CelestialTargetId,
  SpectralMode,
  ViewStage,
  InspectionViewMode,
  SensorFilterMode,
};

const INITIAL_POV_STATE: {
  inspectionMode: InspectionViewMode;
  povYawDeg: number;
  povPitchDeg: number;
  povFovZoom: 1 | 2 | 4;
  povSensorMode: SensorFilterMode;
} = {
  inspectionMode: 'MODEL_CLOSEUP',
  povYawDeg: 0,
  povPitchDeg: -8,
  povFovZoom: 1,
  povSensorMode: 'OPTICAL_RGB',
};

const INITIAL_DEVICE_CONTROL_STATE: {
  deviceCameraViewId: DeviceCameraViewId;
  activePartGroupId: DevicePartGroupId;
  rotorSpinMode: RotorSpinMode;
  rotorStepDeg: RotorStepDeg;
} = {
  deviceCameraViewId: 'overview',
  activePartGroupId: 'all',
  rotorSpinMode: 'stopped',
  rotorStepDeg: 0,
};

interface CosmosState {
  activeBodyId: BodyId;
  activeDeviceId: string | null;
  assetLoad: { status: 'idle' | 'loading' | 'ready' | 'error' | 'unavailable'; progress?: number; message?: string };
  assetRetryTick: number;
  deviceCameraViewId: DeviceCameraViewId;
  deviceCameraTick: number;
  activePartGroupId: DevicePartGroupId;
  rotorSpinMode: RotorSpinMode;
  rotorStepDeg: RotorStepDeg;
  rotorStepTick: number;
  inspectionMode: InspectionViewMode;
  povYawDeg: number;
  povPitchDeg: number;
  povFovZoom: 1 | 2 | 4;
  povSensorMode: SensorFilterMode;
  showOrbits: boolean;
  showPOIs: boolean;
  selectBody: (bodyId: BodyId) => void;
  selectDevice: (id: string) => void;
  retryAsset: () => void;
  setAssetLoad: (id: string, load: CosmosState['assetLoad']) => void;
  setDeviceCameraView: (viewId: DeviceCameraViewId) => void;
  setActivePartGroup: (groupId: DevicePartGroupId) => void;
  setRotorSpinMode: (mode: RotorSpinMode) => void;
  setRotorStepDeg: (deg: RotorStepDeg) => void;
  resetDeviceControl: () => void;
  setInspectionMode: (mode: InspectionViewMode) => void;
  setPovOrientation: (yawDeg: number, pitchDeg: number) => void;
  setPovFovZoom: (zoom: 1 | 2 | 4) => void;
  setPovSensorMode: (mode: SensorFilterMode) => void;
  resetPovCamera: () => void;
  toggleOrbits: () => void;
  togglePOIs: () => void;
  viewStage: ViewStage;
  activeTarget: CelestialTarget | null;
  timeScale: number;          // Tốc độ tua thời gian (1 = thực tế, 1000 = tua nhanh quỹ đạo)
  simulationTime: number;     // Thời gian mô phỏng tích lũy (đọc trực tiếp trong useFrame)
  spectralMode: SpectralMode;
  audioMuted: boolean;
  controlsLocked: boolean;
  loadingProgress: number;
  requiredAssetsReady: boolean;
  loadingStatusLabel: string;
  loadingTasks: Record<string, number>;
  cameraAltitudeKm: number;
  cameraResetTick: number;
  floatingOriginOffset: THREE.Vector3;

  // Dynamic runtime positions of orbiting bodies & rotating surface POIs
  dynamicPositions: Record<string, THREE.Vector3>;

  // Actions
  reportAssetTaskProgress: (taskId: string, progressPct: number, label?: string) => void;
  setLoadingProgress: (progress: number) => void;
  startLaunchSequence: () => void;
  completeLaunchSequence: () => void;
  completePreloader: () => void;
  selectTarget: (target: CelestialTarget | null) => void;
  enterSurfaceLanding: () => void;
  returnToOrbit: () => void;
  setViewStage: (stage: ViewStage) => void;
  setTimeScale: (scale: number) => void;
  setSpectralMode: (mode: SpectralMode) => void;
  toggleAudio: () => void;
  advanceSimulationTime: (delta: number) => void;
  setCameraAltitudeKm: (altitudeKm: number) => void;
  setFloatingOriginOffset: (offset: THREE.Vector3) => void;
  updateDynamicPosition: (id: CelestialTargetId, position: THREE.Vector3) => void;
}

const REQUIRED_LOADING_TASKS = [
  'mars_surface_maps',
  'decoders_and_models',
] as const;

export const useCosmosStore = create<CosmosState>()(
  subscribeWithSelector((set, get) => ({
    activeBodyId: 'mars',
    activeDeviceId: null,
    assetLoad: { status: 'idle' },
    assetRetryTick: 0,
    ...INITIAL_DEVICE_CONTROL_STATE,
    ...INITIAL_POV_STATE,
    deviceCameraTick: 0,
    rotorStepTick: 0,
    showOrbits: true,
    showPOIs: true,
    selectBody: (bodyId) => {
      if (!BODY_CATALOG[bodyId]) return;
      set((state) => ({
        activeBodyId: bodyId,
        activeTarget: null,
        activeDeviceId: null,
        assetLoad: { status: 'idle' },
        ...INITIAL_DEVICE_CONTROL_STATE,
        ...INITIAL_POV_STATE,
        rotorStepTick: state.rotorStepTick + 1,
        dynamicPositions: {},
        viewStage: 'ORBITAL_OVERVIEW',
        spectralMode: 'VISUAL_RGB',
        controlsLocked: false,
        cameraResetTick: state.cameraResetTick + 1,
        floatingOriginOffset: new THREE.Vector3(),
      }));
    },
    selectDevice: (id) => {
      const device = DEVICE_CATALOG.find((item) => item.id === id && item.bodyId === get().activeBodyId);
      if (!device) return;
      const available = device.status === 'available';
      const current = get();
      const keepReady = current.activeDeviceId === id && current.assetLoad.status === 'ready';
      set((state) => ({
        activeDeviceId: id,
        activeTarget: null,
        viewStage: available ? 'SUB_SCENE' : 'ORBITAL_OVERVIEW',
        controlsLocked: false,
        assetLoad: keepReady ? current.assetLoad : { status: available ? 'loading' : 'unavailable' },
        ...INITIAL_DEVICE_CONTROL_STATE,
        ...INITIAL_POV_STATE,
        deviceCameraTick: state.deviceCameraTick + 1,
        rotorStepTick: state.rotorStepTick + 1,
      }));
    },
    retryAsset: () => set((state) => ({ assetRetryTick: state.assetRetryTick + 1 })),
    setAssetLoad: (id, assetLoad) => { if (get().activeDeviceId === id) set({ assetLoad }); },
    setDeviceCameraView: (viewId) =>
      set((state) => ({
        deviceCameraViewId: viewId,
        deviceCameraTick: state.deviceCameraTick + 1,
      })),
    setActivePartGroup: (groupId) => set({ activePartGroupId: groupId }),
    setRotorSpinMode: (mode) => set({ rotorSpinMode: mode }),
    setRotorStepDeg: (deg) =>
      set((state) => ({
        rotorStepDeg: deg,
        rotorSpinMode: 'stopped',
        rotorStepTick: state.rotorStepTick + 1,
      })),
    resetDeviceControl: () =>
      set((state) => ({
        ...INITIAL_DEVICE_CONTROL_STATE,
        deviceCameraTick: state.deviceCameraTick + 1,
        rotorStepTick: state.rotorStepTick + 1,
      })),
    setInspectionMode: (mode) =>
      set((state) => {
        const hasDevice = Boolean(state.activeDeviceId);
        const hasTarget = Boolean(state.activeTarget);
        const nextStage =
          mode === 'CONTROL_ROOM_POV' || hasDevice || hasTarget
            ? 'SUB_SCENE'
            : state.viewStage;
        return {
          inspectionMode: mode,
          viewStage: nextStage,
          controlsLocked: false,
          ...(mode === 'CONTROL_ROOM_POV'
            ? { povYawDeg: 0, povPitchDeg: -8, povFovZoom: 1 as const }
            : {}),
        };
      }),
    setPovOrientation: (yawDeg, pitchDeg) =>
      set({
        povYawDeg: Math.max(-180, Math.min(180, yawDeg)),
        povPitchDeg: Math.max(-45, Math.min(45, pitchDeg)),
      }),
    setPovFovZoom: (zoom) => set({ povFovZoom: zoom }),
    setPovSensorMode: (mode) => set({ povSensorMode: mode }),
    resetPovCamera: () => set({ povYawDeg: 0, povPitchDeg: -8, povFovZoom: 1 }),
    toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
    togglePOIs: () => set((state) => ({ showPOIs: !state.showPOIs })),
    viewStage: 'ORBITAL_OVERVIEW',
    activeTarget: null,
    timeScale: 100,
    simulationTime: 0,
    spectralMode: 'VISUAL_RGB',
    audioMuted: true,
    controlsLocked: false,
    loadingProgress: 0,
    requiredAssetsReady: false,
    loadingStatusLabel: 'Đang khởi tạo hệ thống quang học & bộ giải mã...',
    loadingTasks: {
      mars_surface_maps: 0,
      decoders_and_models: 0,
    },
    cameraAltitudeKm: 84610,
    cameraResetTick: 0,
    floatingOriginOffset: new THREE.Vector3(0, 0, 0),
    dynamicPositions: {},

    reportAssetTaskProgress: (taskId, progressPct, label) =>
      set((state) => {
        const clamped = Math.max(0, Math.min(100, progressPct));
        const nextTasks = { ...state.loadingTasks, [taskId]: clamped };
        const total = REQUIRED_LOADING_TASKS.reduce(
          (sum, key) => sum + (nextTasks[key] ?? 0),
          0,
        );
        const avgProgress = Math.round(total / REQUIRED_LOADING_TASKS.length);
        const allDone = REQUIRED_LOADING_TASKS.every((key) => (nextTasks[key] ?? 0) >= 100);

        return {
          loadingTasks: nextTasks,
          loadingProgress: avgProgress,
          requiredAssetsReady: allDone,
          loadingStatusLabel: allDone
            ? 'Tài nguyên lõi đã sẵn sàng • Chờ lệnh nhảy Alpha'
            : (label ?? state.loadingStatusLabel),
        };
      }),

    setLoadingProgress: (progress) =>
      set((state) => ({
        loadingProgress: Math.max(state.loadingProgress, Math.min(100, progress)),
      })),

    startLaunchSequence: () => {
      if (!get().requiredAssetsReady) return;
      set({
        viewStage: 'LAUNCHING',
        controlsLocked: true,
      });
    },

    completeLaunchSequence: () =>
      set({
        viewStage: 'ORBITAL_OVERVIEW',
        loadingProgress: 100,
        controlsLocked: false,
      }),

    completePreloader: () =>
      set({
        viewStage: 'ORBITAL_OVERVIEW',
        loadingProgress: 100,
        controlsLocked: false,
      }),

    selectTarget: (target) => {
      if (target && target.bodyId !== get().activeBodyId) return;
      if (!target) {
        set({
          activeTarget: null,
          activeDeviceId: null,
          assetLoad: { status: 'idle' },
          ...INITIAL_DEVICE_CONTROL_STATE,
          ...INITIAL_POV_STATE,
          viewStage: 'ORBITAL_OVERVIEW',
          controlsLocked: false,
        });
        return;
      }

      // Sync target position with its latest dynamic orbital/rotational world position
      const dynamicPos = get().dynamicPositions[target.id];
      const syncedTarget: CelestialTarget = dynamicPos
        ? { ...target, position: dynamicPos.clone() }
        : { ...target, position: target.position.clone() };

      set({
        activeTarget: syncedTarget,
        activeDeviceId: null,
        assetLoad: { status: 'idle' },
        ...INITIAL_DEVICE_CONTROL_STATE,
        ...INITIAL_POV_STATE,
        ...(get().spectralMode === 'TERRAIN_MESH_3D' ? { spectralMode: 'VISUAL_RGB' as const } : {}),
        viewStage: 'WARPING',
        controlsLocked: true,
      });
    },

    enterSurfaceLanding: () => {
      const current = get().activeTarget;
      if (current?.coordinates && current.isSurfaceLanding) {
        set({
          viewStage: 'SURFACE_CESIUM',
          controlsLocked: false,
        });
      }
    },

    returnToOrbit: () =>
      set((state) => ({
        activeTarget: null,
        activeDeviceId: null,
        assetLoad: { status: 'idle' },
        ...INITIAL_DEVICE_CONTROL_STATE,
        ...INITIAL_POV_STATE,
        spectralMode: state.spectralMode === 'TERRAIN_MESH_3D' ? 'VISUAL_RGB' : state.spectralMode,
        viewStage: 'WARPING',
        controlsLocked: true,
        cameraResetTick: state.cameraResetTick + 1,
      })),

    setViewStage: (stage) =>
      set({
        viewStage: stage,
        controlsLocked:
          stage === 'WARPING' || stage === 'PRELOADING' || stage === 'LAUNCHING',
      }),

    setTimeScale: (scale) => set({ timeScale: scale }),

    setSpectralMode: (mode) => {
      const currentBody = get().activeBodyId;
      if (currentBody === 'moon' && mode !== 'VISUAL_RGB') return;
      set((state) => ({
        spectralMode: mode,
        ...(mode === 'TERRAIN_MESH_3D'
          ? {
              activeDeviceId: null,
              inspectionMode: 'MODEL_CLOSEUP' as const,
              viewStage: 'SUB_SCENE' as const,
              controlsLocked: false,
              cameraResetTick: state.cameraResetTick + 1,
            }
          : state.spectralMode === 'TERRAIN_MESH_3D' && !state.activeTarget && !state.activeDeviceId
            ? {
                viewStage: 'ORBITAL_OVERVIEW' as const,
                controlsLocked: false,
              }
            : {}),
      }));
    },

    toggleAudio: () => set((state) => ({ audioMuted: !state.audioMuted })),

    advanceSimulationTime: (delta) =>
      set((state) => ({
        simulationTime: state.simulationTime + delta * state.timeScale,
      })),

    setCameraAltitudeKm: (altitudeKm) => set({ cameraAltitudeKm: altitudeKm }),

    setFloatingOriginOffset: (offset) => set({ floatingOriginOffset: offset.clone() }),

    updateDynamicPosition: (id, position) => {
      const dict = get().dynamicPositions;
      if (!dict[id]) {
        dict[id] = position.clone();
      } else {
        dict[id].copy(position);
      }
    },
  })),
);
