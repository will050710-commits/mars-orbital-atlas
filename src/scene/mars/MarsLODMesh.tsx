import { useEffect, useMemo, useState } from 'react';
import { Detailed } from '@react-three/drei';
import { Vector2 } from 'three';
import type { BodyConfig } from '../../types/cosmos.types';
import {
  generateProceduralMarsTextures,
  generateProceduralMoonTextures,
  loadBakedMarsWebPTextures,
  loadBakedMoonWebPTextures,
  type BakedMarsWebPSet,
  type BodyPlanetaryTextures,
} from '../../core/loaders/useProgressiveAsset';
import { useCosmosStore } from '../../store/useCosmosStore';

export function MarsLODMesh({ body }: { body: BodyConfig }) {
  const spectralMode = useCosmosStore((state) => state.spectralMode);
  const [textures, setTextures] = useState<BodyPlanetaryTextures | null>(null);
  const normalScale = useMemo(
    () => (body.id === 'moon' ? new Vector2(2.35, 2.35) : new Vector2(1.55, 1.55)),
    [body.id],
  );

  useEffect(() => {
    if (body.textureStyle === 'plain') {
      setTextures(null);
      return;
    }

    const controller = new AbortController();
    const owned =
      body.textureStyle === 'illustrative-moon'
        ? generateProceduralMoonTextures()
        : generateProceduralMarsTextures();
    let baked: BakedMarsWebPSet | null = null;

    setTextures(owned);

    if (
      body.textureStyle === 'illustrative-mars' ||
      body.textureStyle === 'illustrative-moon'
    ) {
      const loadBaked =
        body.textureStyle === 'illustrative-moon'
          ? loadBakedMoonWebPTextures
          : loadBakedMarsWebPTextures;
      void loadBaked({ flipY: true, signal: controller.signal })
        .then((webpSet) => {
          if (controller.signal.aborted) {
            webpSet.albedo.dispose();
            webpSet.normal.dispose();
            webpSet.roughness.dispose();
            return;
          }
          baked = webpSet;
          owned.albedo.dispose();
          owned.normal.dispose();
          owned.roughness.dispose();
          setTextures({
            albedo: webpSet.albedo,
            normal: webpSet.normal,
            roughness: webpSet.roughness,
            thermalPreview: owned.thermalPreview,
            elevationPreview: owned.elevationPreview,
          });
        })
        .catch(() => {
          // Graceful fallback: retain procedural Mars textures when offline/aborted
        });
    }

    return () => {
      controller.abort();
      if (baked) {
        baked.albedo.dispose();
        baked.normal.dispose();
        baked.roughness.dispose();
        owned.thermalPreview.dispose();
        owned.elevationPreview.dispose();
      } else {
        Object.values(owned).forEach((texture) => texture.dispose());
      }
    };
  }, [body.textureStyle]);

  const activeMap = useMemo(() => {
    if (!textures) return null;
    if (spectralMode === 'MOLA_ELEVATION') return textures.elevationPreview;
    if (spectralMode === 'THERMAL_IR') return textures.thermalPreview;
    return textures.albedo;
  }, [spectralMode, textures]);

  const isFalseColor = spectralMode === 'MOLA_ELEVATION' || spectralMode === 'THERMAL_IR';
  const materialKey = `${body.id}-${body.textureStyle}-${spectralMode}-${activeMap?.uuid ?? 'plain'}`;

  return (
    <Detailed distances={[0, body.radiusKm * 5, body.radiusKm * 18]}>
      {[96, 48, 24].map((segments) => (
        <mesh key={segments}>
          <sphereGeometry args={[body.radiusKm, segments, segments]} />
          <meshStandardMaterial
            key={materialKey}
            color={
              textures
                ? body.id === 'moon' && !isFalseColor
                  ? '#c2c4ca'
                  : '#ffffff'
                : body.color
            }
            map={activeMap}
            normalMap={textures?.normal ?? null}
            normalScale={normalScale}
            roughnessMap={textures?.roughness ?? null}
            roughness={body.id === 'moon' ? 0.92 : 0.88}
            metalness={0.04}
            emissive={isFalseColor ? '#ffffff' : '#000000'}
            emissiveMap={isFalseColor ? activeMap : null}
            emissiveIntensity={isFalseColor ? 0.22 : 0}
          />
        </mesh>
      ))}
    </Detailed>
  );
}
