import React from 'react';
import type * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export interface PostProcessingRigProps {
  sunLightRef?: React.RefObject<THREE.DirectionalLight | null>;
}

export const PostProcessingRig: React.FC<PostProcessingRigProps> = () => {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      <Bloom
        intensity={1.15}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.25}
        mipmapBlur
      />
      <Vignette
        offset={0.25}
        darkness={0.65}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
};
