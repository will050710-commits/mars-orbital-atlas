import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Selection } from '@react-three/postprocessing';
import { CosmosSceneRoot } from '../../scene/CosmosSceneRoot';
import { PostProcessingRig } from '../postprocessing/PostProcessingRig';
import { SplineCameraRig } from '../camera/SplineCameraRig';
import { FloatingOriginManager } from './FloatingOriginManager';

export const MarsCanvas: React.FC = () => {
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);

  return (
    <div className="mars-canvas-wrapper">
      <Canvas
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
          near: 0.1,        // Kết hợp logarithmicDepthBuffer cho phép near rất nhỏ (0.1m)
          far: 1e10,        // và far cực lớn (10 triệu km) mà không bị nhấp nháy bề mặt
          position: [0, 8000, 88000],
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#020205']} />
        <Suspense fallback={null}>
          <Selection>
            <FloatingOriginManager>
              <CosmosSceneRoot sunLightRef={directionalLightRef} />
            </FloatingOriginManager>
            <SplineCameraRig />
            <PostProcessingRig sunLightRef={directionalLightRef} />
          </Selection>
        </Suspense>
      </Canvas>
    </div>
  );
};
