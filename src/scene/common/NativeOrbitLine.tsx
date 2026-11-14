import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';

export interface NativeOrbitLineProps {
  points: THREE.Vector3[];
  color: string;
  opacity?: number;
  transparent?: boolean;
}

/**
 * Memory-safe native Three.js line primitive that deterministically disposes its
 * BufferGeometry and LineBasicMaterial on unmount, avoiding @react-three/drei Line2 leaks.
 */
export const NativeOrbitLine: React.FC<NativeOrbitLineProps> = ({
  points,
  color,
  opacity = 1,
  transparent = true,
}) => {
  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      opacity,
      transparent,
    });
    return new THREE.Line(geometry, material);
  }, [points]);

  useEffect(() => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.color.set(color);
    mat.opacity = opacity;
    mat.transparent = transparent;
  }, [lineObj, color, opacity, transparent]);

  useEffect(() => {
    return () => {
      lineObj.geometry.dispose();
      (lineObj.material as THREE.Material).dispose();
    };
  }, [lineObj]);

  return <primitive object={lineObj} dispose={null} />;
};
