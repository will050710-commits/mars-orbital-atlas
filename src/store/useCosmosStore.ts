import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';
import type {
  CelestialTarget,
  CelestialTargetId,
  SpectralMode,
  ViewStage,
} from '../types/cosmos.types';

export type { CelestialTarget, CelestialTargetId, SpectralMode, ViewStage };

interface CosmosState {
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
    viewStage: 'PRELOADING',
    activeTarget: null,
    timeScale: 100,
    simulationTime: 0,
    spectralMode: 'VISUAL_RGB',
    audioMuted: false,
    controlsLocked: true,
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
      if (!target) {
        set({
          activeTarget: null,
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
        viewStage: 'WARPING',
        controlsLocked: true,
      });
    },

    enterSurfaceLanding: () => {
      const current = get().activeTarget;
      if (current?.coordinates) {
        set({
          viewStage: 'SURFACE_CESIUM',
          controlsLocked: false,
        });
      }
    },

    returnToOrbit: () =>
      set((state) => ({
        activeTarget: null,
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

    setSpectralMode: (mode) => set({ spectralMode: mode }),

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
