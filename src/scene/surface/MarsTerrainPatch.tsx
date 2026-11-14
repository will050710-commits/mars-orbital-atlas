import { useEffect, useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { assetManager } from '../../core/loaders/AssetStreamManager';
import { disposeModel } from '../../core/loaders/modelResources';
import {
  generateProceduralMarsTextures,
  generateProceduralMoonTextures,
  loadBakedMarsWebPTextures,
  type BakedMarsWebPSet,
  type BodyPlanetaryTextures,
} from '../../core/loaders/useProgressiveAsset';
import type { BodyId, SensorFilterMode, SpectralMode } from '../../types/cosmos.types';

export const MARS_TERRAIN_GLB_PATH = '/assets/models/mars/mars_terrain.glb';

export interface MarsTerrainPatchProps {
  bodyId: BodyId;
  locationKey?: string;
  sensorMode?: SensorFilterMode;
  spectralMode?: SpectralMode;
  /** Target footprint width in scene units (X span; Z is 0.5 * X). Default 14 for showcase, 28 for POV. */
  footprintWidth?: number;
  /** Vertical exaggeration multiplier relative to raw heightfield. */
  heightScale?: number;
  onSurfaceReady?: (centerGroundY: number) => void;
  onError?: (message: string) => void;
}

function resolveEffectiveSensor(
  sensorMode: SensorFilterMode | undefined,
  spectralMode: SpectralMode | undefined,
): SensorFilterMode {
  if (sensorMode) return sensorMode;
  if (spectralMode === 'MOLA_ELEVATION') return 'ELEVATION_GRID';
  if (spectralMode === 'THERMAL_IR') return 'THERMAL_FALSE';
  return 'OPTICAL_RGB';
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function elevationColorRGB(t: number, mode: SensorFilterMode): [number, number, number] {
  const clamped = THREE.MathUtils.clamp(t, 0, 1);

  if (mode === 'NAVCAM_MONO') {
    const band = Math.abs(((clamped * 12) % 1) - 0.5) < 0.04 ? 0.1 : 0;
    const v = THREE.MathUtils.clamp(0.18 + clamped * 0.72 + band, 0, 1);
    return [v * 0.94, v * 0.98, v];
  }

  if (mode === 'ELEVATION_GRID') {
    // Hypsometric palette (lowlands cobalt -> plains teal/olive -> highlands amber -> peaks pale cream)
    const contour = Math.abs(((clamped * 14) % 1) - 0.5) < 0.045 ? 0.16 : 0;
    let r = 0;
    let g = 0;
    let b = 0;
    if (clamped < 0.25) {
      const k = clamped / 0.25;
      r = THREE.MathUtils.lerp(0.1, 0.14, k);
      g = THREE.MathUtils.lerp(0.24, 0.58, k);
      b = THREE.MathUtils.lerp(0.55, 0.62, k);
    } else if (clamped < 0.55) {
      const k = (clamped - 0.25) / 0.3;
      r = THREE.MathUtils.lerp(0.14, 0.68, k);
      g = THREE.MathUtils.lerp(0.58, 0.64, k);
      b = THREE.MathUtils.lerp(0.62, 0.25, k);
    } else if (clamped < 0.85) {
      const k = (clamped - 0.55) / 0.3;
      r = THREE.MathUtils.lerp(0.68, 0.86, k);
      g = THREE.MathUtils.lerp(0.64, 0.36, k);
      b = THREE.MathUtils.lerp(0.25, 0.18, k);
    } else {
      const k = (clamped - 0.85) / 0.15;
      r = THREE.MathUtils.lerp(0.86, 0.96, k);
      g = THREE.MathUtils.lerp(0.36, 0.9, k);
      b = THREE.MathUtils.lerp(0.18, 0.86, k);
    }
    return [
      THREE.MathUtils.clamp(r + contour, 0, 1),
      THREE.MathUtils.clamp(g + contour, 0, 1),
      THREE.MathUtils.clamp(b + contour, 0, 1),
    ];
  }

  // THERMAL_FALSE (ironbow-inspired infrared gradient)
  const contour = Math.abs(((clamped * 10) % 1) - 0.5) < 0.03 ? 0.08 : 0;
  let r = 0;
  let g = 0;
  let b = 0;
  if (clamped < 0.3) {
    const k = clamped / 0.3;
    r = THREE.MathUtils.lerp(0.08, 0.42, k);
    g = THREE.MathUtils.lerp(0.05, 0.08, k);
    b = THREE.MathUtils.lerp(0.24, 0.56, k);
  } else if (clamped < 0.65) {
    const k = (clamped - 0.3) / 0.35;
    r = THREE.MathUtils.lerp(0.42, 0.92, k);
    g = THREE.MathUtils.lerp(0.08, 0.32, k);
    b = THREE.MathUtils.lerp(0.56, 0.12, k);
  } else {
    const k = (clamped - 0.65) / 0.35;
    r = THREE.MathUtils.lerp(0.92, 1.0, k);
    g = THREE.MathUtils.lerp(0.32, 0.94, k);
    b = THREE.MathUtils.lerp(0.12, 0.52, k);
  }
  return [
    THREE.MathUtils.clamp(r + contour, 0, 1),
    THREE.MathUtils.clamp(g + contour, 0, 1),
    THREE.MathUtils.clamp(b + contour, 0, 1),
  ];
}

function applyVertexSensorColors(root: THREE.Object3D, mode: SensorFilterMode): void {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const geom = obj.geometry;
    const pos = geom.getAttribute('position');
    if (!pos) return;

    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const span = Math.max(maxY - minY, 1e-4);
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i += 1) {
      const normY = (pos.getY(i) - minY) / span;
      const [r, g, b] = elevationColorRGB(normY, mode);
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  });
}

function createProceduralMoonTerrainMesh(
  seed: string,
  footprintWidth: number,
  heightScale: number,
): THREE.Group {
  const depth = footprintWidth * 0.5;
  const geom = new THREE.PlaneGeometry(footprintWidth, depth, 144, 96);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.getAttribute('position');
  const s = hashSeed(seed);
  const isComplexCrater = seed.includes('tycho') || seed.includes('copernicus');
  const isHadleyRille = seed.includes('hadley') || seed.includes('15');
  const isTaurusLittrow = seed.includes('taurus') || seed.includes('17');

  const craters = [
    {
      x: (s - 0.5) * footprintWidth * 0.22,
      z: (0.25 - s * 0.5) * depth * 0.22,
      r: footprintWidth * (isComplexCrater ? 0.24 : 0.16),
      d: isComplexCrater ? 0.62 : 0.44,
      peak: isComplexCrater ? 0.34 : 0.12,
    },
    {
      x: (0.45 - s * 0.8) * footprintWidth * 0.38,
      z: (s - 0.45) * depth * 0.38,
      r: footprintWidth * 0.11,
      d: 0.32,
      peak: 0.08,
    },
    { x: -footprintWidth * 0.26, z: depth * 0.2, r: footprintWidth * 0.085, d: 0.24, peak: 0 },
    { x: footprintWidth * 0.28, z: -depth * 0.18, r: footprintWidth * 0.095, d: 0.26, peak: 0.06 },
    { x: -footprintWidth * 0.12, z: -depth * 0.26, r: footprintWidth * 0.06, d: 0.18, peak: 0 },
    { x: footprintWidth * 0.16, z: depth * 0.24, r: footprintWidth * 0.055, d: 0.16, peak: 0 },
    { x: -footprintWidth * 0.34, z: -depth * 0.08, r: footprintWidth * 0.045, d: 0.14, peak: 0 },
    { x: footprintWidth * 0.35, z: depth * 0.11, r: footprintWidth * 0.05, d: 0.15, peak: 0 },
  ];

  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    let y =
      Math.sin(x * 0.55 + s * 6.28) * Math.cos(z * 0.62 - s * 3.1) * 0.18 +
      Math.sin(x * 1.4 - z * 1.1) * 0.07 +
      Math.cos(x * 3.8 + z * 3.2) * 0.025;

    // Hadley Rille sinuous canyon groove for Apollo 15 site
    if (isHadleyRille) {
      const rilleCenterX = Math.sin(z * 0.45 + 0.6) * footprintWidth * 0.12 - footprintWidth * 0.18;
      const rilleDist = Math.abs(x - rilleCenterX) / (footprintWidth * 0.065);
      if (rilleDist < 1.5) {
        y -= Math.exp(-rilleDist * rilleDist * 1.8) * 0.42;
      }
    }

    // Taurus-Littrow North & South Massif flanking ridges for Apollo 17 site
    if (isTaurusLittrow) {
      const massifFactor = Math.pow(Math.abs(z) / (depth * 0.5), 2.2);
      y += massifFactor * 0.52;
    }

    for (const crater of craters) {
      const dist = Math.hypot(x - crater.x, z - crater.z) / crater.r;
      if (dist < 1.55) {
        const bowl = dist < 1.0 ? Math.max(0, 1 - Math.pow(dist, 2.2)) : 0;
        const rim = Math.exp(-Math.pow((dist - 1.0) / 0.15, 2)) * crater.d * 0.48;
        const peak =
          crater.peak > 0 && dist < 0.35
            ? Math.exp(-Math.pow(dist / 0.14, 2)) * crater.peak
            : 0;
        y += rim - bowl * crater.d + peak;
      }
    }
    pos.setY(i, y * heightScale + 0.35 * heightScale);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: '#d4d6dc',
    roughness: 0.9,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geom, material);
  mesh.name = 'ProceduralMoonRegolith';
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

function sampleCenterGroundHeight(root: THREE.Object3D): number {
  root.updateMatrixWorld(true);
  const raycaster = new THREE.Raycaster(
    new THREE.Vector3(0, 100, 0),
    new THREE.Vector3(0, -1, 0),
  );
  const hits = raycaster.intersectObject(root, true);
  if (hits.length > 0 && Number.isFinite(hits[0].point.y)) {
    return hits[0].point.y;
  }
  const bounds = new THREE.Box3().setFromObject(root);
  return Number.isFinite(bounds.min.y) ? bounds.min.y : 0;
}

/**
 * Lazy-loaded 3D terrain relief component.
 * - Mars: streams `mars_terrain.glb` (10,404-vertex Plane) + baked 8K WebP maps (`flipY: false`).
 * - Moon: synthesizes an illustrative procedural cratered regolith relief mesh (zero `.glb` requests).
 */
export function MarsTerrainPatch({
  bodyId,
  locationKey = 'default',
  sensorMode,
  spectralMode,
  footprintWidth = 14,
  heightScale = 1,
  onSurfaceReady,
  onError,
}: MarsTerrainPatchProps) {
  const { gl } = useThree();
  const effectiveSensor = resolveEffectiveSensor(sensorMode, spectralMode);
  const [terrainRoot, setTerrainRoot] = useState<THREE.Group | null>(null);
  const [marsWebP, setMarsWebP] = useState<BakedMarsWebPSet | null>(null);
  const [fallbackTex, setFallbackTex] = useState<BodyPlanetaryTextures | null>(null);
  const normalScale = useMemo(() => new THREE.Vector2(1.35, 1.35), []);
  const onSurfaceReadyRef = useRef(onSurfaceReady);
  const onErrorRef = useRef(onError);
  onSurfaceReadyRef.current = onSurfaceReady;
  onErrorRef.current = onError;

  useEffect(() => {
    const controller = new AbortController();
    let ownedRoot: THREE.Group | null = null;
    let ownedWebP: BakedMarsWebPSet | null = null;
    let ownedFallback: BodyPlanetaryTextures | null = null;

    setTerrainRoot(null);
    setMarsWebP(null);
    setFallbackTex(null);

    if (bodyId === 'moon') {
      ownedFallback = generateProceduralMoonTextures();
      ownedFallback.albedo.flipY = false;
      ownedFallback.normal.flipY = false;
      ownedFallback.roughness.flipY = false;
      ownedRoot = createProceduralMoonTerrainMesh(locationKey, footprintWidth, heightScale);
      applyVertexSensorColors(ownedRoot, 'ELEVATION_GRID');
      setFallbackTex(ownedFallback);
      setTerrainRoot(ownedRoot);
      onSurfaceReadyRef.current?.(sampleCenterGroundHeight(ownedRoot));

      return () => {
        controller.abort();
        if (ownedRoot) disposeModel(ownedRoot);
        if (ownedFallback) {
          Object.values(ownedFallback).forEach((tex) => tex.dispose());
        }
      };
    }

    ownedFallback = generateProceduralMarsTextures();
    ownedFallback.albedo.flipY = false;
    ownedFallback.normal.flipY = false;
    ownedFallback.roughness.flipY = false;
    setFallbackTex(ownedFallback);

    assetManager.initWithRenderer(gl);

    const terrainPromise = assetManager.loadModel(MARS_TERRAIN_GLB_PATH, controller.signal, () => {});
    const texturePromise = loadBakedMarsWebPTextures({
      flipY: false,
      signal: controller.signal,
    }).catch(() => null);

    void Promise.all([terrainPromise, texturePromise])
      .then(([scene, webp]) => {
        if (controller.signal.aborted) {
          disposeModel(scene);
          if (webp) {
            webp.albedo.dispose();
            webp.normal.dispose();
            webp.roughness.dispose();
          }
          return;
        }

        scene.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(scene);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const rawSpanX = Math.max(size.x, 1e-4);
        const xzScale = footprintWidth / rawSpanX;
        const yScale = xzScale * heightScale * 2.2;

        const container = new THREE.Group();
        const yawOffset = (hashSeed(locationKey) - 0.5) * 0.45;
        scene.position.set(-center.x, -bounds.min.y, -center.z);
        container.add(scene);
        container.scale.set(xzScale, yScale, xzScale);
        container.rotation.y = yawOffset;

        applyVertexSensorColors(scene, 'ELEVATION_GRID');
        ownedRoot = container;
        if (webp) {
          ownedWebP = webp;
          setMarsWebP(webp);
        }
        setTerrainRoot(container);
        onSurfaceReadyRef.current?.(sampleCenterGroundHeight(container));
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : String(error);
        onErrorRef.current?.(message);
      });

    return () => {
      controller.abort();
      if (ownedRoot) disposeModel(ownedRoot);
      if (ownedWebP) {
        ownedWebP.albedo.dispose();
        ownedWebP.normal.dispose();
        ownedWebP.roughness.dispose();
      }
      if (ownedFallback) {
        Object.values(ownedFallback).forEach((tex) => tex.dispose());
      }
    };
  }, [bodyId, footprintWidth, gl, heightScale, locationKey]);

  useEffect(() => {
    if (!terrainRoot) return;
    const isOptical = effectiveSensor === 'OPTICAL_RGB';
    if (!isOptical) {
      applyVertexSensorColors(terrainRoot, effectiveSensor);
    }

    const albedo = isOptical ? (marsWebP?.albedo ?? fallbackTex?.albedo ?? null) : null;
    const normal = marsWebP?.normal ?? fallbackTex?.normal ?? null;
    const roughness = marsWebP?.roughness ?? fallbackTex?.roughness ?? null;

    terrainRoot.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = new THREE.MeshStandardMaterial({
        color: isOptical ? '#ffffff' : '#f1f5f9',
        map: albedo,
        normalMap: normal,
        normalScale,
        roughnessMap: roughness,
        roughness: isOptical ? 0.88 : 0.92,
        metalness: 0.04,
        vertexColors: !isOptical,
        emissive:
          effectiveSensor === 'THERMAL_FALSE'
            ? new THREE.Color('#2d1208')
            : effectiveSensor === 'ELEVATION_GRID'
              ? new THREE.Color('#09131c')
              : new THREE.Color('#000000'),
        emissiveIntensity: effectiveSensor === 'OPTICAL_RGB' ? 0 : 0.35,
      });

      const oldMat = obj.material;
      obj.material = mat;
      if (Array.isArray(oldMat)) {
        oldMat.forEach((m) => m.dispose());
      } else if (oldMat) {
        oldMat.dispose();
      }
    });
  }, [effectiveSensor, fallbackTex, marsWebP, normalScale, terrainRoot]);

  return terrainRoot ? <primitive object={terrainRoot} dispose={null} /> : null;
}
