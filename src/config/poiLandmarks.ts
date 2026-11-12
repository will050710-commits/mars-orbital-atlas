import * as THREE from 'three';
import type { CelestialTarget, CelestialTargetId } from '../types/cosmos.types';
import { CELESTIAL_BODIES_CATALOG, MARS_MEAN_RADIUS_KM } from './celestialCatalog';

/**
 * Converts planetocentric Latitude / Longitude (in degrees) and radius (in km)
 * into a 3D Cartesian coordinate vector on the Mars sphere.
 */
export function latLonToMarsVector3(
  latDeg: number,
  lonDeg: number,
  radiusKm: number = MARS_MEAN_RADIUS_KM,
): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - latDeg);
  const theta = THREE.MathUtils.degToRad(lonDeg + 180);

  const x = -radiusKm * Math.sin(phi) * Math.cos(theta);
  const y = radiusKm * Math.cos(phi);
  const z = radiusKm * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

const POI_SURFACE_OFFSET_KM = 18; // Nhô nhẹ trên bề mặt để neo nhãn 3D

export const POI_LANDMARKS_CATALOG: CelestialTarget[] = [
  {
    id: 'olympus_mons',
    name: 'Olympus Mons',
    subtitle: 'Núi lửa hình khiên lớn nhất Hệ Mặt Trời (+21.2 km)',
    category: 'SURFACE_POI',
    position: latLonToMarsVector3(18.65, 226.2, MARS_MEAN_RADIUS_KM + POI_SURFACE_OFFSET_KM),
    radius: 310,
    safeViewDistance: 1250,
    isSurfaceLanding: true,
    coordinates: {
      lat: 18.65,
      lon: 226.2,
      height: 38000,
      elevationKm: 21.229,
    },
    telemetry: {
      classification: 'Núi lửa hình khiên khổng lồ (Large Shield Volcano)',
      meanTemperatureC: '-72 °C tại đỉnh caldera',
      atmosphericPressurePa: '72 Pa (~12% áp suất trung bình bề mặt Sao Hỏa)',
      surfaceGravityMs2: '3.71 m/s²',
      orbitalVelocityKms: '0.228 km/s (Vận tốc quay bề mặt)',
      geologicalAge: 'Kỷ Hesperian - Amazonian (Phun trào gần nhất ~25 triệu năm trước)',
      missionSummary:
        'Cao gấp gần 2,5 lần đỉnh Everest tính từ mực chuẩn MOLA, rộng 624 km với vách đá bao quanh (basal scarp) dựng đứng cao tới 8 km và miệng caldera phức hợp rộng 85 × 60 km.',
      keyHighlights: [
        'Tọa độ: 18,65°B, 226,20°Đ (Vùng núi lửa Tharsis)',
        'Độ cao đỉnh MOLA: +21.229 m • Đường kính chân núi: 624 km',
        'Áp suất đỉnh núi cực thấp, vượt trên hầu hết các cơn bão bụi toàn cầu',
      ],
    },
  },
  {
    id: 'valles_marineris',
    name: 'Valles Marineris',
    subtitle: 'Hệ thống hẻm núi kiến tạo dài 4.000 km • Sâu 7 km',
    category: 'SURFACE_POI',
    position: latLonToMarsVector3(-13.9, 300.8, MARS_MEAN_RADIUS_KM + POI_SURFACE_OFFSET_KM),
    radius: 400,
    safeViewDistance: 1450,
    isSurfaceLanding: true,
    coordinates: {
      lat: -13.9,
      lon: 300.8,
      height: 28000,
      elevationKm: -7.1,
    },
    telemetry: {
      classification: 'Hệ thống thung lũng tách giãn kiến tạo (Tectonic Rift System)',
      meanTemperatureC: '-48 °C (Đáy hẻm núi ấm hơn vùng cao nguyên)',
      atmosphericPressurePa: '890 Pa (Áp suất cao tại đáy hẻm núi sâu)',
      surfaceGravityMs2: '3.725 m/s²',
      orbitalVelocityKms: '0.234 km/s',
      geologicalAge: ' ~3.5 tỷ năm (Kỷ Hesperian)',
      missionSummary:
        'Trải dài gần 1/4 chu vi xích đạo Sao Hỏa, hình thành khi vùng vỏ Tharsis phồng lên làm nứt toác bề mặt hành tinh, sau đó mở rộng bởi xói mòn nước ngầm và sạt lở vách đá.',
      keyHighlights: [
        'Tọa độ trung tâm (Melas Chasma): 13,90°N, 300,80°Đ',
        'Chiều dài: 4.000 km • Chiều rộng: 200 km • Độ sâu tối đa: ~7.100 m',
        'Thường xuất hiện lớp sương mù buổi sáng sớm ở đáy vực sâu',
      ],
    },
  },
  {
    id: 'jezero_crater',
    name: 'Miệng Hố Jezero (Jezero Crater)',
    subtitle: 'Châu thổ sông cổ đại • Bãi đáp Rover Perseverance & Ingenuity',
    category: 'SURFACE_POI',
    position: latLonToMarsVector3(18.38, 77.58, MARS_MEAN_RADIUS_KM + POI_SURFACE_OFFSET_KM),
    radius: 180,
    safeViewDistance: 980,
    isSurfaceLanding: true,
    coordinates: {
      lat: 18.38,
      lon: 77.58,
      height: 16500,
      elevationKm: -2.5,
    },
    telemetry: {
      classification: 'Hố va chạm chứa hồ cổ đại & châu thổ trầm tích (Paleolake Basin)',
      meanTemperatureC: '-55 °C (Ban ngày -15 °C, Ban đêm -85 °C)',
      atmosphericPressurePa: '740 Pa',
      surfaceGravityMs2: '3.721 m/s²',
      orbitalVelocityKms: '0.229 km/s',
      geologicalAge: '3.8 – 3.9 tỷ năm (Kỷ Noachian)',
      missionSummary:
        'Hố va chạm đường kính 45 km nằm ở rìa tây bồn địa Isidis Planitia, nơi một dòng sông cổ đại từng đổ vào tạo nên quạt châu thổ giàu sét smectite và khoáng vật cacbonat — nơi lưu giữ dấu vết sinh học tiềm năng.',
      keyHighlights: [
        'Tọa độ hạ cánh Mars 2020 Perseverance: 18,38°B, 77,58°Đ',
        'Đường kính hố: 45,0 km • Độ cao MOLA: -2.500 m',
        'Đã thu thập các ống mẫu lõi đá trầm tích chờ sứ mệnh Mars Sample Return',
      ],
    },
  },
  {
    id: 'hellas_planitia',
    name: 'Bồn Địa Hellas Planitia',
    subtitle: 'Bồn địa va chạm sâu nhất trên Sao Hỏa (-8.2 km)',
    category: 'SURFACE_POI',
    position: latLonToMarsVector3(-42.4, 70.5, MARS_MEAN_RADIUS_KM + POI_SURFACE_OFFSET_KM),
    radius: 450,
    safeViewDistance: 1650,
    isSurfaceLanding: true,
    coordinates: {
      lat: -42.4,
      lon: 70.5,
      height: 42000,
      elevationKm: -8.2,
    },
    telemetry: {
      classification: 'Bồn địa va chạm siêu lớn (Giant Impact Basin)',
      meanTemperatureC: '-52 °C',
      atmosphericPressurePa: '1.155 Pa (Cao hơn 89% áp suất chuẩn MOLA)',
      surfaceGravityMs2: '3.73 m/s²',
      orbitalVelocityKms: '0.178 km/s',
      geologicalAge: '~4.1 – 3.8 tỷ năm (Giai đoạn bắn phá dữ dội muộn)',
      missionSummary:
        'Đường kính tới 2.300 km và sâu hơn 8 km. Nhờ độ sâu lớn, áp suất khí quyển ở đáy Hellas đủ cao để nước lỏng có thể tồn tại thoáng qua nếu nhiệt độ vượt trên 0 °C.',
      keyHighlights: [
        'Tọa độ trung tâm: 42,40°N, 70,50°Đ',
        'Điểm thấp nhất trên Sao Hỏa (Badwater Crater): -8.200 m',
        'Chênh lệch độ cao với đỉnh Olympus Mons lên tới gần 30 km',
      ],
    },
  },
  {
    id: 'gale_crater',
    name: 'Miệng Hố Gale (Aeolis Mons)',
    subtitle: 'Núi trầm tích Mount Sharp cao 5.5 km • Sứ mệnh Curiosity Rover',
    category: 'SURFACE_POI',
    position: latLonToMarsVector3(-5.4, 137.8, MARS_MEAN_RADIUS_KM + POI_SURFACE_OFFSET_KM),
    radius: 210,
    safeViewDistance: 1050,
    isSurfaceLanding: true,
    coordinates: {
      lat: -5.4,
      lon: 137.8,
      height: 19000,
      elevationKm: -4.5,
    },
    telemetry: {
      classification: 'Hố va chạm có đỉnh trung tâm phân lớp trầm tích',
      meanTemperatureC: '-46 °C',
      atmosphericPressurePa: '840 Pa',
      surfaceGravityMs2: '3.72 m/s²',
      orbitalVelocityKms: '0.240 km/s',
      geologicalAge: '3.5 – 3.8 tỷ năm',
      missionSummary:
        'Đường kính 154 km với ngọn núi trung tâm Aeolis Mons (Mount Sharp) cao 5,5 km. Các lớp đá từ chân lên đỉnh ghi lại quá trình Sao Hỏa chuyển mình từ hành tinh ẩm ướt sang khô hạn.',
      keyHighlights: [
        'Tọa độ Bradbury Landing (Curiosity): 5,40°N, 137,80°Đ',
        'Phát hiện hợp chất hữu cơ và dao động khí Methane theo mùa',
        'Các lớp khoáng vật sét chuyển dần sang muối sunfat theo độ cao',
      ],
    },
  },
];

export const ALL_CELESTIAL_TARGETS: CelestialTarget[] = [
  ...CELESTIAL_BODIES_CATALOG,
  ...POI_LANDMARKS_CATALOG,
];

export function findTargetById(id: CelestialTargetId): CelestialTarget | undefined {
  return ALL_CELESTIAL_TARGETS.find((item) => item.id === id);
}
