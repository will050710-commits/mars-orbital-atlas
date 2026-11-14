import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { assetManager } from '../../core/loaders/AssetStreamManager';
import { disposeModel, normalizePreview } from '../../core/loaders/modelResources';
import { useCosmosStore } from '../../store/useCosmosStore';

interface OrbitalGlbModelProps {
  modelPath: string;
  /** Target half-extent along the model's longest dimension after normalization. */
  visualRadius: number;
  targetId?: string;
  isSelected?: boolean;
  accentColor?: string;
  /** Optional slow self-rotation rad/s around Y (useful for Phobos/Deimos in orbit). */
  spinAxisYRate?: number;
  /** Report loading progress and errors into the global HUD store (used in Option 1 studio closeup). */
  reportToStore?: boolean;
  /** Show a subtle selection reticle ring in orbital overview when selected. */
  showSelectionRing?: boolean;
}

function configureGlbTextures(root: THREE.Object3D, maxAniso: number, highDetail: boolean) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = highDetail;
    mesh.receiveShadow = highDetail;
    if (!highDetail) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      if (!mat) continue;
      for (const value of Object.values(mat)) {
        if (value && typeof value === 'object' && 'isTexture' in value) {
          const tex = value as THREE.Texture;
          tex.anisotropy = maxAniso;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          tex.needsUpdate = true;
        }
      }
    }
  });
}

/**
 * Shared loader & renderer for official NASA GLB assets used both directly in
 * planetary orbits (Mars & Moon) and in Option 1 3D Close-Up inspection.
 */
export function OrbitalGlbModel({
  modelPath,
  visualRadius,
  targetId,
  isSelected = false,
  accentColor = '#38bdf8',
  spinAxisYRate = 0,
  reportToStore = false,
  showSelectionRing = false,
}: OrbitalGlbModelProps) {
  const gl = useThree((state) => state.gl);
  const spinGroupRef = useRef<THREE.Group>(null);
  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let ownedGroup: THREE.Group | null = null;

    if (reportToStore) {
      useCosmosStore.setState({ assetLoad: { status: 'loading', progress: 5 } });
    }

    assetManager
      .loadModel(modelPath, controller.signal, (percent) => {
        if (reportToStore && active) {
          useCosmosStore.setState({
            assetLoad: { status: 'loading', progress: percent ?? 50 },
          });
        }
      })
      .then((scene) => {
        if (!active || controller.signal.aborted) {
          disposeModel(scene);
          return;
        }
        const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
        configureGlbTextures(scene, maxAniso, reportToStore);
        const normalized = normalizePreview(scene);
        ownedGroup = normalized;
        setModelGroup(normalized);
        if (reportToStore) {
          useCosmosStore.setState({ assetLoad: { status: 'ready', progress: 100 } });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || !active) return;
        if (reportToStore) {
          const message = error instanceof Error ? error.message : 'Unable to load orbital GLB model.';
          useCosmosStore.setState({ assetLoad: { status: 'error', message } });
        }
      });

    return () => {
      active = false;
      controller.abort();
      setModelGroup(null);
      if (ownedGroup) {
        disposeModel(ownedGroup);
        ownedGroup = null;
      }
      if (reportToStore) {
        useCosmosStore.setState({ assetLoad: { status: 'idle' } });
      }
    };
  }, [modelPath, targetId, gl, reportToStore]);

  useFrame((_, dt) => {
    if (spinGroupRef.current && spinAxisYRate !== 0) {
      spinGroupRef.current.rotation.y += dt * spinAxisYRate;
    }
  });

  const ringInner = Math.max(1.05, visualRadius * 1.18);
  const ringOuter = Math.max(1.12, visualRadius * 1.24);

  return (
    <group>
      <group ref={spinGroupRef}>
        {modelGroup ? (
          <primitive object={modelGroup} dispose={null} scale={visualRadius} />
        ) : null}
      </group>

      {showSelectionRing && isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringInner, ringOuter, 48]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
