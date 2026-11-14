import { CELESTIAL_BODIES_CATALOG, MARS_MEAN_RADIUS_KM } from './celestialCatalog';
import { ATLAS_POIS, latLonToBodyVector } from './atlasPOIs';
export const POI_LANDMARKS_CATALOG = ATLAS_POIS;
export const ALL_CELESTIAL_TARGETS = [...CELESTIAL_BODIES_CATALOG, ...POI_LANDMARKS_CATALOG];
export function findTargetById(id: string) { return ALL_CELESTIAL_TARGETS.find((target) => target.id === id); }
export function latLonToMarsVector3(lat: number, lon: number, radius = MARS_MEAN_RADIUS_KM) {
  return latLonToBodyVector(lat, lon, radius);
}
