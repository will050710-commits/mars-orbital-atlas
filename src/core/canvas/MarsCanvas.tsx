import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';
import { CosmosSceneRoot } from '../../scene/CosmosSceneRoot';
import { PostProcessingRig } from '../postprocessing/PostProcessingRig';
import { SplineCameraRig } from '../camera/SplineCameraRig';
import { FloatingOriginManager } from './FloatingOriginManager';
import { registerRenderer } from './rendererDiagnostics';

export const MarsCanvas: React.FC = () => {
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);

  return (
    <div className="mars-canvas-wrapper">
      <Canvas
        onCreated={({ gl }) => registerRenderer(gl)}
        gl={{
          powerPreference: 'high-performance',
          antialias: false, // Tắt MSAA mặc định để nhường tài nguyên cho Postprocessing SMAA
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: true, // Khử Z-fighting ở khoảng cách liên hành tinh
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{
          fov: 45,
          near: 1,
          far: 1000000,
          position: [0, 8000, 88000],
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#020205']} />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Suspense fallback={null}>
          <FloatingOriginManager>
            <CosmosSceneRoot sunLightRef={directionalLightRef} />
          </FloatingOriginManager>
          <SplineCameraRig />
          <PostProcessingRig />
        </Suspense>
      </Canvas>
    </div>
  );
};
