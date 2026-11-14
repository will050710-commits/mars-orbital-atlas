import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
import type { Group, Object3D } from 'three';
import { getDeviceControlSpec } from '../../config/deviceControlSpecs';
import { assetManager } from '../../core/loaders/AssetStreamManager';
import { classifyAssetError, disposeModel, normalizePreview } from '../../core/loaders/modelResources';
import { useCosmosStore } from '../../store/useCosmosStore';
import type { DeviceRecord } from '../../types/cosmos.types';
import {
  applyCoaxialRotorRotation,
  applyDevicePartHighlight,
  prepareControlledDeviceScene,
} from './deviceControlRuntime';

export function DeviceModel({ device }: { device: DeviceRecord }) {
  const { gl } = useThree();
  const retry = useCosmosStore((state) => state.assetRetryTick);
  const activePartGroupId = useCosmosStore((state) => state.activePartGroupId);
  const rotorStepDeg = useCosmosStore((state) => state.rotorStepDeg);
  const rotorStepTick = useCosmosStore((state) => state.rotorStepTick);
  const [model, setModel] = useState<Group | null>(null);
  const nodeMapRef = useRef<Record<string, Object3D>>({});
  const rotorPhaseRef = useRef(0);
  const spec = getDeviceControlSpec(device.id);

  useEffect(() => {
    if (device.status !== 'available' || !device.modelPath) return;
    const controller = new AbortController();
    let owned: Group | null = null;
    const report = useCosmosStore.getState().setAssetLoad;
    nodeMapRef.current = {};
    rotorPhaseRef.current = 0;
    setModel(null);
    report(device.id, { status: 'loading', progress: 0 });
    assetManager.initWithRenderer(gl);
    void assetManager.loadModel(device.modelPath, controller.signal, (progress) => {
      if (!controller.signal.aborted) report(device.id, { status: 'loading', progress });
    }).then((scene) => {
      if (controller.signal.aborted) { disposeModel(scene); return; }
      owned = scene;
      scene.rotation.set(...device.transform.rotation);
      const normalized = normalizePreview(scene);
      if (spec) {
        nodeMapRef.current = prepareControlledDeviceScene(normalized);
      }
      setModel(normalized);
      report(device.id, { status: 'ready' });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      if (owned) { disposeModel(owned); owned = null; }
      const failure = classifyAssetError(error);
      report(device.id, { status: 'error', message: `${failure.kind}: ${failure.message}` });
    });
    return () => {
      controller.abort();
      nodeMapRef.current = {};
      if (owned) disposeModel(owned);
    };
  }, [device, gl, retry, spec]);

  useEffect(() => {
    if (!model || !spec) return;
    applyDevicePartHighlight(model, spec, activePartGroupId);
  }, [model, spec, activePartGroupId]);

  useEffect(() => {
    if (!model || !spec?.rotorControl) return;
    const phaseRad = MathUtils.degToRad(rotorStepDeg);
    rotorPhaseRef.current = phaseRad;
    applyCoaxialRotorRotation(nodeMapRef.current, spec.rotorControl, phaseRad);
  }, [model, spec, rotorStepDeg, rotorStepTick]);

  useFrame((_, delta) => {
    if (!model || !spec?.rotorControl) return;
    if (useCosmosStore.getState().rotorSpinMode !== 'demo_slow') return;
    const nextPhase =
      (rotorPhaseRef.current + Math.min(delta, 0.05) * spec.rotorControl.demoSpinRadPerSec) %
      (Math.PI * 2);
    rotorPhaseRef.current = nextPhase;
    applyCoaxialRotorRotation(nodeMapRef.current, spec.rotorControl, nextPhase);
  });

  return model ? <primitive object={model} dispose={null} /> : null;
}
