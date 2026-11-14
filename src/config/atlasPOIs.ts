import { Vector3 } from 'three';
import { BODY_CATALOG, UNKNOWN_TELEMETRY } from './bodyCatalog';
import type { BodyId, CelestialTarget, SourceReference } from '../types/cosmos.types';

// Planetocentric latitude, east-positive longitude; +Y north, +X at 0°, -Z at 90°E.
export function latLonToBodyVector(lat: number, lon: number, radius: number): Vector3 {
  const phi = lat * Math.PI / 180;
  const theta = lon * Math.PI / 180;
  return new Vector3(radius * Math.cos(phi) * Math.cos(theta), radius * Math.sin(phi), -radius * Math.cos(phi) * Math.sin(theta));
}

interface LandmarkOptions {
  subtitle?: string;
  summary?: string;
  highlights?: string[];
}

export function landmark(
  bodyId: BodyId,
  id: string,
  name: string,
  lat: number,
  lon: number,
  source: SourceReference,
  options: LandmarkOptions = {},
): CelestialTarget {
  const body = BODY_CATALOG[bodyId];
  return {
    id, bodyId, name, subtitle: options.subtitle ?? 'Tâm địa danh · IAU / USGS', category: 'SURFACE_POI',
    position: latLonToBodyVector(lat, lon, body.radiusKm + 18), radius: 100,
    safeViewDistance: body.radiusKm * 0.8, isSurfaceLanding: false,
    // Height is a camera offset, not measured terrain. No elevation is supplied.
    coordinates: { lat, lon, height: 0 },
    source,
    telemetry: { ...UNKNOWN_TELEMETRY, classification: 'Địa danh',
      missionSummary: options.summary ?? 'Tọa độ tâm địa danh từ Gazetteer of Planetary Nomenclature. Không phải tọa độ chính xác của thiết bị hoặc bãi đáp.',
      keyHighlights: options.highlights ?? ['Vĩ độ hành tinh tâm; kinh độ đông 0–360°.', 'Độ cao, ảnh và địa hình tại đây chưa được tích hợp.'],
    },
  };
}

function iauFeature(bodyId: 'mars' | 'moon', name: string, feature: number): SourceReference {
  return {
    title: `IAU / USGS · ${name}`,
    url: `https://planetarynames.wr.usgs.gov/Feature/${feature}`,
    checked: '2026-11-14',
    version: bodyId === 'mars'
      ? 'Feature page, default planetocentric +East coordinates'
      : 'Feature page, planetographic +East, -180–180; near-spherical display approximation',
  };
}

const moonFeatureHighlights = [
  'Vĩ độ/kinh độ từ trang Gazetteer (planetographic +East); Mặt Trăng gần cầu nên dùng cho hiển thị.',
  'Độ cao, ảnh và địa hình tại đây chưa được tích hợp.',
];

export const ATLAS_POIS: CelestialTarget[] = [
  landmark('mars', 'jezero_crater', 'Jezero', 18.41, 77.69, iauFeature('mars', 'Jezero', 14300)),
  landmark('mars', 'gale_crater', 'Gale', -5.44, 137.70, iauFeature('mars', 'Gale', 2071)),
  landmark('mars', 'olympus_mons', 'Olympus Mons', 18.40, 226.00, iauFeature('mars', 'Olympus Mons', 4453)),
  landmark('mars', 'valles_marineris', 'Valles Marineris', -13.74, 300.80, iauFeature('mars', 'Valles Marineris', 6288)),
  // Gazetteer center is 8.35°, 30.83°E (planetographic, +East). Stored east-positive 0–360°.
  landmark('moon', 'mare_tranquillitatis', 'Mare Tranquillitatis', 8.35, 30.83, iauFeature('moon', 'Mare Tranquillitatis', 3691), {
    highlights: moonFeatureHighlights,
  }),
  // Gazetteer center is -43.30°, -11.22° (planetographic, +East). Stored as 348.78°E.
  landmark('moon', 'tycho', 'Tycho', -43.30, 348.78, iauFeature('moon', 'Tycho', 6163), {
    highlights: moonFeatureHighlights,
  }),
  // NASA publishes this orthographic view center (53°S, 191°E); the basin itself is not an IAU-named feature.
  landmark('moon', 'south_pole_aitken', 'South Pole–Aitken', -53.0, 191.0, {
    title: "NASA Science · The Moon's Largest Basin",
    url: 'https://science.nasa.gov/resource/the-moons-largest-basin/',
    checked: '2026-11-14',
    version: 'Orthographic view centered 53°S, 191°E; basin boundary not defined by IAU',
  }, {
    subtitle: 'Vùng lõm · NASA (tâm khung nhìn)',
    summary: 'Tâm khung nhìn của bản đồ NASA cho vùng lõm South Pole–Aitken. Đây không phải tâm địa danh do IAU xác lập; ranh giới vùng lõm không được định nghĩa trong Gazetteer.',
    highlights: ['Tâm khung nhìn 53°S, 191°E; không phải tọa độ bãi đáp.', 'Độ cao, ảnh và địa hình tại đây chưa được tích hợp.'],
  }),
];
