import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { assetManager } from './KTX2DracoManager';
import { useCosmosStore } from '../../store/useCosmosStore';

export interface BodyPlanetaryTextures {
  albedo: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
  thermalPreview: THREE.Texture;
  elevationPreview: THREE.Texture;
}


/**
 * Deterministic 2D/3D value noise for realistic Martian terrain synthesis
 * (Olympus Mons, Tharsis Rise, Valles Marineris canyon, Hellas basin, Syrtis Major dark basalt, polar ice caps).
 */
function fract(x: number): number {
  return x - Math.floor(x);
}

function hash2D(ix: number, iy: number): number {
  return fract(Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123);
}

function smoothNoise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 5): number {
  let value = 0;
  let amplitude = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise2D(x * freq, y * freq);
    freq *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

/**
 * Computes normalized topological height [-1, 1] at given equirectangular UV (u in [0,1], v in [0,1])
 */
function sampleMarsTopography(u: number, v: number): number {
  const lon = (u - 0.5) * 360; // -180 to +180
  const lat = (0.5 - v) * 180; // +90 (North) to -90 (South)

  // Base planetary dichotomy: Northern lowlands (Vastitas Borealis) vs Southern highlands
  const dichotomy = -0.25 * Math.tanh((lat - 12) / 18);

  // Tharsis bulge around lon = -110 (250E), lat = 5
  const dTharsis = Math.hypot((lon - 46) / 48, (lat - 8) / 36);
  const tharsisBulge = 0.48 * Math.exp(-dTharsis * dTharsis);

  // Olympus Mons shield volcano near lon = 46.2 (226.2E shifted), lat = 18.65
  const dOlympus = Math.hypot((lon - 46.2) / 6.5, (lat - 18.65) / 6.5);
  const olympusPeak = 0.72 * Math.exp(-dOlympus * dOlympus * 2.2);

  // Valles Marineris tectonic canyon near lon = 120.8 (300.8E), lat = -13.9
  const dVallesLon = (lon - 120.8) / 26;
  const dVallesLat = (lat + 13.9 + Math.sin(dVallesLon * 2.5) * 1.8) / 3.2;
  const vallesCanyon =
    Math.abs(dVallesLon) < 1.1
      ? -0.62 * Math.exp(-dVallesLat * dVallesLat * 2.5) * (1 - dVallesLon * dVallesLon * 0.7)
      : 0;

  // Hellas Planitia deep impact basin near lon = -109.5 (70.5E), lat = -42.4
  const dHellas = Math.hypot((lon + 109.5) / 24, (lat + 42.4) / 18);
  const hellasBasin = -0.68 * Math.exp(-dHellas * dHellas * 1.7);

  // Multi-scale crater & ridge roughness
  const n = fbm(u * 14, v * 7, 5) * 0.42 - 0.21;

  return THREE.MathUtils.clamp(
    dichotomy + tharsisBulge + olympusPeak + vallesCanyon + hellasBasin + n,
    -1,
    1,
  );
}

function makeDataTexture(data: Uint8Array, width: number, height: number, isSRGB: boolean): THREE.Texture {
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function computeNormalMap(heightField: Float32Array, width: number, height: number, bumpStrength: number): Uint8Array {
  const normalData = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const yUp = Math.max(0, y - 1);
    const yDown = Math.min(height - 1, y + 1);
    for (let x = 0; x < width; x++) {
      const xLeft = (x - 1 + width) % width;
      const xRight = (x + 1) % width;
      const dX = (heightField[y * width + xRight] - heightField[y * width + xLeft]) * bumpStrength;
      const dY = (heightField[yDown * width + x] - heightField[yUp * width + x]) * bumpStrength;
      const invLen = 1 / Math.sqrt(dX * dX + dY * dY + 1);
      const nx = (-dX * invLen * 0.5 + 0.5) * 255;
      const ny = (-dY * invLen * 0.5 + 0.5) * 255;
      const nz = (invLen * 0.5 + 0.5) * 255;
      const p4 = (y * width + x) * 4;
      normalData[p4] = Math.round(nx);
      normalData[p4 + 1] = Math.round(ny);
      normalData[p4 + 2] = Math.round(nz);
      normalData[p4 + 3] = 255;
    }
  }
  return normalData;
}

interface CachedPixelBuffers {
  width: number;
  height: number;
  albedoData: Uint8Array;
  normalData: Uint8Array;
  roughnessData: Uint8Array;
  thermalData: Uint8Array;
  elevationData: Uint8Array;
}

let cachedMarsPixels: CachedPixelBuffers | null = null;
let cachedMoonPixels: CachedPixelBuffers | null = null;

export function generateProceduralMarsTextures(): BodyPlanetaryTextures {
  if (!cachedMarsPixels) {
    const width = 1024;
    const height = 512;

    const albedoData = new Uint8Array(width * height * 4);
    const roughnessData = new Uint8Array(width * height * 4);
    const thermalData = new Uint8Array(width * height * 4);
    const molaData = new Uint8Array(width * height * 4);
    const heightField = new Float32Array(width * height);

    // Pass 1: Compute heightfield, Albedo, Roughness, Thermal IR, and MOLA Elevation
    for (let y = 0; y < height; y++) {
      const v = y / (height - 1);
      const lat = (0.5 - v) * 180;
      const absLat = Math.abs(lat);

      for (let x = 0; x < width; x++) {
        const u = x / (width - 1);
        const idx = y * width + x;
        const p4 = idx * 4;

        const elev = sampleMarsTopography(u, v);
        heightField[idx] = elev;

        const detail = fbm(u * 32 + 5.2, v * 16 + 1.7, 4);
        const darkBasalt = fbm(u * 6.5 + 2.1, v * 4.5 + 8.4, 3);

        // Polar ice caps (North & South CO2/H2O caps)
        const polarFactor = THREE.MathUtils.smoothstep(absLat + detail * 8, 76, 86);

        // Albedo RGB: Rusty iron-oxide ochre, dark basalt plains (Syrtis Major / Acidalia), bright dust, polar ice
        let r = 198 + elev * 34 + (detail - 0.5) * 45;
        let g = 96 + elev * 22 + (detail - 0.5) * 32;
        let b = 52 + elev * 14 + (detail - 0.5) * 24;

        if (darkBasalt > 0.56 && absLat < 58) {
          const basaltMix = THREE.MathUtils.clamp((darkBasalt - 0.56) * 3.2, 0, 0.68);
          r = THREE.MathUtils.lerp(r, 82, basaltMix);
          g = THREE.MathUtils.lerp(g, 54, basaltMix);
          b = THREE.MathUtils.lerp(b, 44, basaltMix);
        }

        // Mix polar ice cap
        r = THREE.MathUtils.lerp(r, 244, polarFactor);
        g = THREE.MathUtils.lerp(g, 240, polarFactor);
        b = THREE.MathUtils.lerp(b, 236, polarFactor);

        albedoData[p4] = THREE.MathUtils.clamp(Math.round(r), 0, 255);
        albedoData[p4 + 1] = THREE.MathUtils.clamp(Math.round(g), 0, 255);
        albedoData[p4 + 2] = THREE.MathUtils.clamp(Math.round(b), 0, 255);
        albedoData[p4 + 3] = 255;

        // Roughness map
        const rough = Math.round(
          THREE.MathUtils.clamp((0.82 - polarFactor * 0.35 + detail * 0.15) * 255, 60, 250),
        );
        roughnessData[p4] = rough;
        roughnessData[p4 + 1] = rough;
        roughnessData[p4 + 2] = rough;
        roughnessData[p4 + 3] = 255;

        // Thermal IR map (insolation + thermal inertia)
        const insolation =
          Math.cos(THREE.MathUtils.degToRad(lat)) * 0.75 + (1 - elev * 0.25) * 0.25;
        const tNorm = THREE.MathUtils.clamp(insolation * 0.85 + detail * 0.2, 0, 1);
        thermalData[p4] = Math.round(THREE.MathUtils.clamp(tNorm * 320, 20, 255));
        thermalData[p4 + 1] = Math.round(THREE.MathUtils.clamp((tNorm - 0.3) * 340, 10, 255));
        thermalData[p4 + 2] = Math.round(
          THREE.MathUtils.clamp((1 - Math.abs(tNorm - 0.35) * 2.2) * 220, 30, 255),
        );
        thermalData[p4 + 3] = 255;

        // MOLA Elevation hypsometric color ramp
        const hNorm = THREE.MathUtils.clamp((elev + 0.85) / 1.75, 0, 1);
        let mr = 0;
        let mg = 0;
        let mb = 0;
        if (hNorm < 0.25) {
          const k = hNorm / 0.25;
          mr = 20;
          mg = Math.round(40 + k * 180);
          mb = Math.round(160 + k * 85);
        } else if (hNorm < 0.55) {
          const k = (hNorm - 0.25) / 0.3;
          mr = Math.round(30 + k * 210);
          mg = Math.round(220 + k * 25);
          mb = Math.round(245 * (1 - k));
        } else if (hNorm < 0.82) {
          const k = (hNorm - 0.55) / 0.27;
          mr = 245;
          mg = Math.round(235 * (1 - k * 0.75));
          mb = Math.round(35 * (1 - k));
        } else {
          const k = (hNorm - 0.82) / 0.18;
          mr = 250;
          mg = Math.round(60 + k * 195);
          mb = Math.round(40 + k * 215);
        }
        molaData[p4] = mr;
        molaData[p4 + 1] = mg;
        molaData[p4 + 2] = mb;
        molaData[p4 + 3] = 255;
      }
    }

    cachedMarsPixels = {
      width,
      height,
      albedoData,
      normalData: computeNormalMap(heightField, width, height, 6.5),
      roughnessData,
      thermalData,
      elevationData: molaData,
    };
  }

  const { width, height, albedoData, normalData, roughnessData, thermalData, elevationData } =
    cachedMarsPixels;
  return {
    albedo: makeDataTexture(albedoData, width, height, true),
    normal: makeDataTexture(normalData, width, height, false),
    roughness: makeDataTexture(roughnessData, width, height, false),
    thermalPreview: makeDataTexture(thermalData, width, height, true),
    elevationPreview: makeDataTexture(elevationData, width, height, true),
  };
}

export interface BakedBodyWebPUrls {
  albedo: string;
  normal: string;
  roughness: string;
}

export interface BakedMarsWebPSet {
  albedo: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
}

export const MARS_BAKED_WEBP_URLS: BakedBodyWebPUrls = {
  albedo: '/assets/textures/mars_albedo_baked.webp',
  normal: '/assets/textures/mars_normals.webp',
  roughness: '/assets/textures/mars_roughness.webp',
};

export const MOON_BAKED_WEBP_URLS: BakedBodyWebPUrls = {
  albedo: '/assets/textures/moon_albedo_baked.webp',
  normal: '/assets/textures/moon_normals.webp',
  roughness: '/assets/textures/moon_roughness.webp',
};

interface CachedBakedWebPImages {
  albedo: TexImageSource;
  normal: TexImageSource;
  roughness: TexImageSource;
}

const bakedWebPImageCache = new Map<string, Promise<CachedBakedWebPImages>>();

function rasterizeImageToPowerOfTwoCanvas(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
): TexImageSource {
  if (typeof document === 'undefined') return img;
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return canvas;
}

function loadWebPImage(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const loader = new THREE.ImageLoader();
    loader.load(
      url,
      (img) => resolve(img),
      undefined,
      (err) => reject(err),
    );
  });
}

/**
 * Loads a baked 8K planetary WebP texture suite asynchronously and caches
 * power-of-two HTMLCanvasElement surfaces (never closeable ImageBitmap singletons)
 * so disposing terrain meshes never blanks out shared orbital globe textures.
 * Callers own disposal of the returned Texture instances.
 */
async function loadBakedBodyWebPTextures(
  cacheKey: string,
  urls: BakedBodyWebPUrls,
  options?: {
    flipY?: boolean;
    signal?: AbortSignal;
  },
): Promise<BakedMarsWebPSet> {
  if (options?.signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
  const flipY = options?.flipY ?? true;

  let cachedPromise = bakedWebPImageCache.get(cacheKey);
  if (!cachedPromise) {
    cachedPromise = Promise.all([
      loadWebPImage(urls.albedo),
      loadWebPImage(urls.normal),
      loadWebPImage(urls.roughness),
    ])
      .then(([albedo, normal, roughness]) => ({
        // Store HTMLCanvasElement instead of ImageBitmap so disposeModel's bitmap.close()
        // on unmounted sub-scenes cannot detach cached globe surface pixels.
        albedo: rasterizeImageToPowerOfTwoCanvas(albedo, 2048, 1024),
        normal: rasterizeImageToPowerOfTwoCanvas(normal, 2048, 1024),
        roughness: rasterizeImageToPowerOfTwoCanvas(roughness, 1024, 512),
      }))
      .catch((err) => {
        bakedWebPImageCache.delete(cacheKey);
        throw err;
      });
    bakedWebPImageCache.set(cacheKey, cachedPromise);
  }

  const images = await cachedPromise;
  if (options?.signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const makeTex = (img: TexImageSource, isSRGB: boolean) => {
    const tex = new THREE.Texture(img);
    tex.flipY = flipY;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  };

  return {
    albedo: makeTex(images.albedo, true),
    normal: makeTex(images.normal, false),
    roughness: makeTex(images.roughness, false),
  };
}

/**
 * Loads the baked 8K Mars WebP texture suite asynchronously.
 */
export function loadBakedMarsWebPTextures(options?: {
  flipY?: boolean;
  signal?: AbortSignal;
}): Promise<BakedMarsWebPSet> {
  return loadBakedBodyWebPTextures('mars', MARS_BAKED_WEBP_URLS, options);
}

/**
 * Loads the baked 8K Moon WebP texture suite asynchronously.
 */
export function loadBakedMoonWebPTextures(options?: {
  flipY?: boolean;
  signal?: AbortSignal;
}): Promise<BakedMarsWebPSet> {
  return loadBakedBodyWebPTextures('moon', MOON_BAKED_WEBP_URLS, options);
}

interface LunarBasinDef {
  nx: number;
  ny: number;
  nz: number;
  cosRadius: number;
  invSpan: number;
  depth: number;
  tintBlue: number;
}

interface LunarCraterDef {
  nx: number;
  ny: number;
  nz: number;
  radiusRad: number;
  depth: number;
  rimHeight: number;
  centralPeak: number;
  rayLengthRad: number;
  rayStrength: number;
  darkFloor: number;
  seed: number;
}

function latLonToUnitVec(latDeg: number, lonDeg: number): [number, number, number] {
  const latRad = THREE.MathUtils.degToRad(latDeg);
  const lonRad = THREE.MathUtils.degToRad(lonDeg);
  const cosLat = Math.cos(latRad);
  return [cosLat * Math.cos(lonRad), Math.sin(latRad), cosLat * Math.sin(lonRad)];
}

const LUNAR_MARIA_BASINS: LunarBasinDef[] = [
  // Oceanus Procellarum (North & South lobes)
  { lat: 22.0, lon: 303.0, radDeg: 28.0, depth: 0.42, tintBlue: 1.0 },
  { lat: 6.0, lon: 308.0, radDeg: 22.0, depth: 0.36, tintBlue: 0.8 },
  // Mare Imbrium
  { lat: 33.0, lon: 344.0, radDeg: 19.5, depth: 0.48, tintBlue: 0.9 },
  // Mare Serenitatis
  { lat: 28.0, lon: 17.5, radDeg: 13.5, depth: 0.46, tintBlue: 0.5 },
  // Mare Tranquillitatis (titanium-rich dark bluish basalt)
  { lat: 8.5, lon: 31.4, radDeg: 15.5, depth: 0.45, tintBlue: 1.35 },
  // Mare Crisium
  { lat: 17.0, lon: 59.1, radDeg: 10.5, depth: 0.48, tintBlue: 0.7 },
  // Mare Fecunditatis
  { lat: -7.8, lon: 51.3, radDeg: 13.5, depth: 0.38, tintBlue: 0.6 },
  // Mare Nectaris
  { lat: -15.2, lon: 35.5, radDeg: 8.5, depth: 0.39, tintBlue: 0.6 },
  // Mare Humorum
  { lat: -24.4, lon: 321.4, radDeg: 9.5, depth: 0.42, tintBlue: 0.75 },
  // Mare Nubium
  { lat: -21.3, lon: 343.4, radDeg: 13.0, depth: 0.37, tintBlue: 0.65 },
  // Mare Vaporum & Sinus Medii
  { lat: 13.3, lon: 3.6, radDeg: 8.5, depth: 0.34, tintBlue: 0.7 },
  // Mare Frigoris
  { lat: 56.0, lon: 355.0, radDeg: 16.0, depth: 0.3, tintBlue: 0.6 },
  // Mare Orientale
  { lat: -19.4, lon: 265.3, radDeg: 9.5, depth: 0.44, tintBlue: 0.5 },
  // Mare Moscoviense (far side)
  { lat: 27.3, lon: 147.9, radDeg: 7.5, depth: 0.4, tintBlue: 0.6 },
  // South Pole-Aitken Basin (massive far-side depression)
  { lat: -53.0, lon: 191.0, radDeg: 34.0, depth: 0.34, tintBlue: 0.4 },
].map((b) => {
  const [nx, ny, nz] = latLonToUnitVec(b.lat, b.lon);
  const cosRadius = Math.cos(THREE.MathUtils.degToRad(b.radDeg));
  return {
    nx,
    ny,
    nz,
    cosRadius,
    invSpan: 1 / Math.max(1e-4, 1 - cosRadius),
    depth: b.depth,
    tintBlue: b.tintBlue,
  };
});

const NAMED_LUNAR_CRATERS: LunarCraterDef[] = [
  // Tycho (prominent southern ray system)
  { lat: -43.31, lon: 348.78, radDeg: 4.2, depth: 0.36, rim: 0.22, peak: 0.16, rayDeg: 38, rayStr: 0.42, darkFloor: 0, seed: 1.1 },
  // Copernicus (terraced rim + bright rays across Mare Insularum)
  { lat: 9.62, lon: 339.92, radDeg: 4.6, depth: 0.35, rim: 0.21, peak: 0.15, rayDeg: 28, rayStr: 0.36, darkFloor: 0, seed: 2.3 },
  // Kepler (bright ray crater in Oceanus Procellarum)
  { lat: 8.1, lon: 322.0, radDeg: 3.1, depth: 0.28, rim: 0.18, peak: 0.1, rayDeg: 20, rayStr: 0.32, darkFloor: 0, seed: 3.7 },
  // Aristarchus (brightest crater on the Moon)
  { lat: 23.7, lon: 312.6, radDeg: 3.2, depth: 0.3, rim: 0.22, peak: 0.12, rayDeg: 22, rayStr: 0.48, darkFloor: 0, seed: 5.1 },
  // Plato (dark basalt-flooded floor on northern Mare Imbrium rim)
  { lat: 51.6, lon: 350.7, radDeg: 4.8, depth: 0.28, rim: 0.2, peak: 0.0, rayDeg: 0, rayStr: 0, darkFloor: 0.38, seed: 6.4 },
  // Clavius (huge southern highland walled plain)
  { lat: -58.4, lon: 345.6, radDeg: 8.2, depth: 0.32, rim: 0.19, peak: 0.06, rayDeg: 0, rayStr: 0, darkFloor: 0, seed: 7.2 },
  // Grimaldi (dark floor near western limb)
  { lat: -5.2, lon: 291.4, radDeg: 6.2, depth: 0.3, rim: 0.16, peak: 0.0, rayDeg: 0, rayStr: 0, darkFloor: 0.42, seed: 8.5 },
  // Langrenus (eastern Mare Fecunditatis rayed crater)
  { lat: -8.9, lon: 60.9, radDeg: 4.8, depth: 0.32, rim: 0.2, peak: 0.14, rayDeg: 20, rayStr: 0.26, darkFloor: 0, seed: 9.8 },
  // Stevinus (bright southeast ray system)
  { lat: -32.5, lon: 54.2, radDeg: 3.6, depth: 0.28, rim: 0.18, peak: 0.11, rayDeg: 22, rayStr: 0.28, darkFloor: 0, seed: 11.2 },
  // Theophilus (Sinus Asperitatis / Mare Nectaris rim)
  { lat: -11.4, lon: 26.4, radDeg: 4.5, depth: 0.33, rim: 0.21, peak: 0.16, rayDeg: 12, rayStr: 0.14, darkFloor: 0, seed: 12.6 },
  // Archimedes (Mare Imbrium interior)
  { lat: 29.7, lon: 356.0, radDeg: 4.0, depth: 0.26, rim: 0.18, peak: 0.0, rayDeg: 0, rayStr: 0, darkFloor: 0.28, seed: 14.1 },
  // Tsiolkovskiy (iconic far-side dark-floored crater with bright central peak)
  { lat: -20.4, lon: 129.1, radDeg: 6.4, depth: 0.36, rim: 0.22, peak: 0.22, rayDeg: 14, rayStr: 0.18, darkFloor: 0.45, seed: 15.9 },
].map((c) => {
  const [nx, ny, nz] = latLonToUnitVec(c.lat, c.lon);
  return {
    nx,
    ny,
    nz,
    radiusRad: THREE.MathUtils.degToRad(c.radDeg),
    depth: c.depth,
    rimHeight: c.rim,
    centralPeak: c.peak,
    rayLengthRad: THREE.MathUtils.degToRad(c.rayDeg),
    rayStrength: c.rayStr,
    darkFloor: c.darkFloor,
    seed: c.seed,
  };
});

const PROCEDURAL_LUNAR_CRATERS: LunarCraterDef[] = (() => {
  const list: LunarCraterDef[] = [...NAMED_LUNAR_CRATERS];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const count = 135;
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    const h1 = hash2D(i * 1.73, 19.37);
    const h2 = hash2D(i * 3.11, 47.83);
    const h3 = hash2D(i * 7.19, 83.29);
    const ny = THREE.MathUtils.clamp(1 - 2 * t + (h1 - 0.5) * 0.08, -0.96, 0.96);
    const rXZ = Math.sqrt(Math.max(0, 1 - ny * ny));
    const theta = i * goldenAngle + h2 * 1.8;
    const nx = rXZ * Math.cos(theta);
    const nz = rXZ * Math.sin(theta);

    const radDeg = 1.6 + Math.pow(h3, 1.8) * 5.4;
    const isRayed = h1 > 0.86 && radDeg > 2.4;
    list.push({
      nx,
      ny,
      nz,
      radiusRad: THREE.MathUtils.degToRad(radDeg),
      depth: 0.16 + h2 * 0.16,
      rimHeight: 0.1 + h3 * 0.1,
      centralPeak: radDeg > 3.8 ? 0.08 + h1 * 0.06 : 0,
      rayLengthRad: isRayed ? THREE.MathUtils.degToRad(radDeg * 3.8) : 0,
      rayStrength: isRayed ? 0.18 + h2 * 0.14 : 0,
      darkFloor: 0,
      seed: i * 1.37 + 20,
    });
  }
  return list;
})();

/**
 * High-detail selenographic lunar surface generator (`1024x512`).
 * Synthesizes recognizable nearside/farside Maria basins, rayed craters (Tycho, Copernicus,
 * Kepler, Aristarchus), 135 multi-scale circular impact craters, crisp normal relief,
 * LOLA-style hypsometric false-color elevation, and Diviner-style thermal IR previews.
 */
export function generateProceduralMoonTextures(): BodyPlanetaryTextures {
  if (!cachedMoonPixels) {
    const width = 1024;
    const height = 512;
    const albedoData = new Uint8Array(width * height * 4);
    const roughnessData = new Uint8Array(width * height * 4);
    const thermalData = new Uint8Array(width * height * 4);
    const elevationData = new Uint8Array(width * height * 4);
    const heightField = new Float32Array(width * height);

    for (let y = 0; y < height; y++) {
      const v = y / (height - 1);
      const latDeg = (0.5 - v) * 180;
      const latRad = THREE.MathUtils.degToRad(latDeg);
      const cosLat = Math.cos(latRad);
      const ny = Math.sin(latRad);

      // Row-level spherical band culling so each x pixel only tests intersecting basins/craters
      const rowBasins: LunarBasinDef[] = [];
      for (let b = 0; b < LUNAR_MARIA_BASINS.length; b++) {
        const basin = LUNAR_MARIA_BASINS[b];
        const horizMag = Math.hypot(basin.nx, basin.nz);
        const maxRowDot = ny * basin.ny + cosLat * horizMag;
        if (maxRowDot > basin.cosRadius - 0.08) {
          rowBasins.push(basin);
        }
      }

      const rowCraters: LunarCraterDef[] = [];
      for (let c = 0; c < PROCEDURAL_LUNAR_CRATERS.length; c++) {
        const cr = PROCEDURAL_LUNAR_CRATERS[c];
        const maxAngle = cr.rayLengthRad > cr.radiusRad ? cr.rayLengthRad : cr.radiusRad * 1.65;
        if (Math.abs(ny - cr.ny) <= maxAngle * 1.15) {
          rowCraters.push(cr);
        }
      }

      for (let x = 0; x < width; x++) {
        const u = x / (width - 1);
        const lonDeg = u * 360;
        const lonRad = THREE.MathUtils.degToRad(lonDeg);
        const nx = cosLat * Math.cos(lonRad);
        const nz = cosLat * Math.sin(lonRad);

        const idx = y * width + x;
        const p4 = idx * 4;

        // Multi-octave highland megaregolith & fine micro-crater noise
        const highlandMacro = fbm(u * 6.5 + 3.1, v * 3.4 + 1.9, 4);
        const mediumNoise = fbm(u * 28 + 4.3, v * 14 + 7.9, 4);
        const fineRegolith = fbm(u * 84 + 1.3, v * 42 + 5.1, 3);
        const wrinkleRidge = Math.pow(1 - Math.abs(fbm(u * 18 + 9.2, v * 9 + 4.4, 3) - 0.5) * 2, 3);

        // Evaluate active Lunar Maria basins for this latitude band in 3D spherical coordinates
        let mariaWeight = 0;
        let mariaBlueTint = 0;
        let basinRingBoost = 0;
        for (let b = 0; b < rowBasins.length; b++) {
          const basin = rowBasins[b];
          const dot = nx * basin.nx + ny * basin.ny + nz * basin.nz;
          if (dot > basin.cosRadius - 0.08) {
            const normDist = (1 - dot) * basin.invSpan;
            if (normDist < 1.35) {
              // Perturb basin edge with macro noise for natural shoreline
              const edgePerturb = normDist + (highlandMacro - 0.5) * 0.24;
              const inside = 1 - THREE.MathUtils.smoothstep(edgePerturb, 0.58, 1.04);
              const w = inside * basin.depth;
              if (w > mariaWeight) {
                mariaWeight = w;
                mariaBlueTint = basin.tintBlue;
              }
              // Surrounding Montes Apenninus / Alpes / basin scarp ring
              const scarp = Math.exp(-Math.pow((edgePerturb - 1.03) / 0.11, 2)) * basin.depth * 0.42;
              if (scarp > basinRingBoost) basinRingBoost = scarp;
            }
          }
        }

        // Evaluate active spherical impact craters & radial bright ejecta ray systems
        let craterElevDelta = 0;
        let craterAlbedoBoost = 0;
        let craterDarkFloor = 0;

        for (let c = 0; c < rowCraters.length; c++) {
          const cr = rowCraters[c];
          const maxAngle = cr.rayLengthRad > cr.radiusRad ? cr.rayLengthRad : cr.radiusRad * 1.65;

          const dot = THREE.MathUtils.clamp(nx * cr.nx + ny * cr.ny + nz * cr.nz, -1, 1);
          const chord = Math.sqrt(Math.max(0, 2 * (1 - dot)));
          if (chord > maxAngle) continue;

          const rNorm = chord / cr.radiusRad;
          if (rNorm < 1.65) {
            if (rNorm < 1.0) {
              // Steep flat-bottomed / terraced bowl depression
              const bowl = 1 - Math.pow(rNorm, 2.4);
              craterElevDelta -= bowl * cr.depth;
              if (cr.darkFloor > 0 && rNorm < 0.82) {
                craterDarkFloor = Math.max(craterDarkFloor, cr.darkFloor * (1 - rNorm * 0.4));
              }
              // Central peak for complex craters
              if (cr.centralPeak > 0 && rNorm < 0.28) {
                const peak = Math.exp(-Math.pow(rNorm / 0.13, 2)) * cr.centralPeak;
                craterElevDelta += peak;
                craterAlbedoBoost += peak * 1.15;
              }
            }
            // Raised circular rim & proximal ejecta rampart
            const rim = Math.exp(-Math.pow((rNorm - 1.0) / 0.16, 2)) * cr.rimHeight;
            craterElevDelta += rim;
            craterAlbedoBoost += rim * 0.95;
          }

          // Radial bright ejecta rays (Tycho, Copernicus, Kepler, Aristarchus, etc.)
          if (cr.rayLengthRad > 0 && chord < cr.rayLengthRad && rNorm > 0.85) {
            const dx = nx - cr.nx;
            const dy = ny - cr.ny;
            const dz = nz - cr.nz;
            const azimuth = Math.atan2(dy, dx + dz * 0.7) + cr.seed;
            const raySpokes =
              Math.pow(Math.max(0, Math.sin(azimuth * 9 + cr.seed * 2.1)), 4) * 0.65 +
              Math.pow(Math.max(0, Math.cos(azimuth * 15 - cr.seed * 1.3)), 6) * 0.55;
            const rayFalloff = Math.pow(1 - chord / cr.rayLengthRad, 1.65);
            craterAlbedoBoost += raySpokes * rayFalloff * cr.rayStrength;
          }
        }

        // Composite selenographic elevation (-1 to +1 normalized around mean sphere)
        const baseHighland = 0.52 + (highlandMacro - 0.5) * 0.28 + (mediumNoise - 0.5) * 0.16 + (fineRegolith - 0.5) * 0.08;
        const elev = THREE.MathUtils.clamp(
          baseHighland -
            mariaWeight * 0.72 +
            basinRingBoost +
            mariaWeight * wrinkleRidge * 0.08 +
            craterElevDelta,
          0.02,
          0.98,
        );
        heightField[idx] = elev;

        // Selenographic Albedo RGB:
        // Dark iron/titanium basalt in Maria (~68-96) vs bright feldspathic highlands (~155-225) + bright ejecta rays
        const mariaFactor = THREE.MathUtils.clamp(mariaWeight * 2.1 + craterDarkFloor, 0, 0.88);
        const highlandGray = 148 + elev * 68 + (mediumNoise - 0.5) * 26 + (fineRegolith - 0.5) * 18;
        const mareGray = 64 + (mediumNoise - 0.5) * 16 + wrinkleRidge * 14;
        const baseGray = THREE.MathUtils.lerp(highlandGray, mareGray, mariaFactor) + craterAlbedoBoost * 115;

        const r = THREE.MathUtils.clamp(Math.round(baseGray * (1.0 - mariaFactor * 0.03 * mariaBlueTint)), 28, 248);
        const g = THREE.MathUtils.clamp(Math.round(baseGray * 0.99), 28, 248);
        const b = THREE.MathUtils.clamp(Math.round(baseGray * (0.96 + mariaFactor * 0.045 * mariaBlueTint)), 28, 250);

        albedoData[p4] = r;
        albedoData[p4 + 1] = g;
        albedoData[p4 + 2] = b;
        albedoData[p4 + 3] = 255;

        // Roughness map: smooth volcanic maria plains (~0.72) vs rough cratered highlands (~0.95)
        const rough = Math.round(
          THREE.MathUtils.clamp((0.94 - mariaFactor * 0.22 + (fineRegolith - 0.5) * 0.1) * 255, 110, 250),
        );
        roughnessData[p4] = rough;
        roughnessData[p4 + 1] = rough;
        roughnessData[p4 + 2] = rough;
        roughnessData[p4 + 3] = 255;

        // LRO Diviner-inspired Thermal IR false-color preview (equatorial sunlit maria warmest, polar craters coldest)
        const insolation = Math.max(0, cosLat) * 0.78 + mariaFactor * 0.16 - elev * 0.12;
        const tNorm = THREE.MathUtils.clamp(insolation + (mediumNoise - 0.5) * 0.08, 0, 1);
        thermalData[p4] = Math.round(THREE.MathUtils.clamp(tNorm * 315, 18, 255));
        thermalData[p4 + 1] = Math.round(THREE.MathUtils.clamp((tNorm - 0.28) * 335, 12, 255));
        thermalData[p4 + 2] = Math.round(
          THREE.MathUtils.clamp((1 - Math.abs(tNorm - 0.32) * 2.1) * 225, 35, 255),
        );
        thermalData[p4 + 3] = 255;

        // LOLA Hypsometric False-Color Elevation Ramp (deep basin violet/blue -> teal/green -> yellow/red/white highlands)
        const hNorm = THREE.MathUtils.clamp((elev - 0.12) / 0.78, 0, 1);
        let lr = 0;
        let lg = 0;
        let lb = 0;
        if (hNorm < 0.25) {
          const k = hNorm / 0.25;
          lr = Math.round(45 * (1 - k) + 20 * k);
          lg = Math.round(20 + k * 175);
          lb = Math.round(165 + k * 80);
        } else if (hNorm < 0.55) {
          const k = (hNorm - 0.25) / 0.3;
          lr = Math.round(25 + k * 215);
          lg = Math.round(195 + k * 45);
          lb = Math.round(245 * (1 - k));
        } else if (hNorm < 0.82) {
          const k = (hNorm - 0.55) / 0.27;
          lr = 245;
          lg = Math.round(240 * (1 - k * 0.76));
          lb = Math.round(30 * (1 - k));
        } else {
          const k = (hNorm - 0.82) / 0.18;
          lr = 252;
          lg = Math.round(58 + k * 192);
          lb = Math.round(40 + k * 212);
        }
        elevationData[p4] = lr;
        elevationData[p4 + 1] = lg;
        elevationData[p4 + 2] = lb;
        elevationData[p4 + 3] = 255;
      }
    }

    cachedMoonPixels = {
      width,
      height,
      albedoData,
      normalData: computeNormalMap(heightField, width, height, 11.5),
      roughnessData,
      thermalData,
      elevationData,
    };
  }

  const { width, height, albedoData, normalData, roughnessData, thermalData, elevationData } =
    cachedMoonPixels;
  return {
    albedo: makeDataTexture(albedoData, width, height, true),
    normal: makeDataTexture(normalData, width, height, false),
    roughness: makeDataTexture(roughnessData, width, height, false),
    thermalPreview: makeDataTexture(thermalData, width, height, true),
    elevationPreview: makeDataTexture(elevationData, width, height, true),
  };
}

export function useProgressiveMarsTextures(renderer: THREE.WebGLRenderer): BodyPlanetaryTextures {
  const [textures, setTextures] = useState<BodyPlanetaryTextures>(() =>
    generateProceduralMarsTextures(),
  );

  useEffect(() => {
    assetManager.initWithRenderer(renderer);
    const store = useCosmosStore.getState();
    store.reportAssetTaskProgress(
      'mars_surface_maps',
      100,
      'Đã hoàn tất bản đồ bề mặt & quang phổ Sao Hỏa',
    );
    setTextures(generateProceduralMarsTextures());
  }, [renderer]);

  return textures;
}

const CORE_MODEL_PATHS = [
  '/assets/models/moons/phobos_draco.glb',
  '/assets/models/moons/deimos_draco.glb',
  '/assets/models/spacecraft/mars_reconnaissance_orbiter.glb',
  '/assets/models/stations/ares_orbital_station_lod0.glb',
];

let coreModelsPreloadStarted = false;

/**
 * Thực sự tải trước các mô hình .glb nén Draco qua Web Worker và báo cáo tiến độ thật vào Zustand store.
 */
export function preloadCoreSpaceAssets(renderer: THREE.WebGLRenderer): void {
  if (coreModelsPreloadStarted) return;
  coreModelsPreloadStarted = true;

  assetManager.initWithRenderer(renderer);
  const store = useCosmosStore.getState();
  store.reportAssetTaskProgress(
    'decoders_and_models',
    10,
    'Đang giải mã mô hình 3D Draco & bộ nạp KTX2...',
  );

  let completed = 0;
  const total = CORE_MODEL_PATHS.length;

  Promise.allSettled(
    CORE_MODEL_PATHS.map((url) =>
      assetManager.gltfLoader.loadAsync(url).finally(() => {
        completed += 1;
        const pct = Math.round((completed / total) * 100);
        useCosmosStore
          .getState()
          .reportAssetTaskProgress(
            'decoders_and_models',
            pct,
            completed < total
              ? `Đang nạp mô hình tàu & vệ tinh (${completed}/${total})...`
              : 'Đã đồng bộ toàn bộ mô hình 3D & bộ giải mã',
          );
      }),
    ),
  );
}
