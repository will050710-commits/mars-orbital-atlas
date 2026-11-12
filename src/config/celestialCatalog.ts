import * as THREE from 'three';
import type { CelestialTarget, OrbitalElements } from '../types/cosmos.types';

export const MARS_MEAN_RADIUS_KM = 3389.5;
export const MARS_EQUATORIAL_RADIUS_KM = 3396.19;
export const MARS_POLAR_RADIUS_KM = 3376.2;
export const MARS_AXIAL_TILT_DEG = 25.19;
export const MARS_AXIAL_TILT_RAD = THREE.MathUtils.degToRad(MARS_AXIAL_TILT_DEG);
export const MARS_SIDEREAL_ROTATION_SECONDS = 88642.68; // 24.6229 hours

const _orbitalEuler = new THREE.Euler(0, 0, 0, 'YXZ');

/**
 * Computes the 3D orbital position around Mars (1 scene unit = 1 km)
 * given Keplerian orbital elements and accumulated simulation time (in seconds).
 * Zero heap allocations per frame when outVector is provided.
 */
export function computeOrbitalPosition(
  elements: OrbitalElements,
  simulationTimeSeconds: number,
  outVector = new THREE.Vector3(),
): THREE.Vector3 {
  const periodSeconds = elements.orbitalPeriodHours * 3600;
  const meanMotion = (Math.PI * 2) / periodSeconds;
  const m0 = THREE.MathUtils.degToRad(elements.meanAnomalyAtEpochDeg);
  const M = m0 + meanMotion * simulationTimeSeconds;

  // First-order Kepler equation approximation (sufficient for near-circular Martian orbits)
  const e = elements.eccentricity;
  const E = M + e * Math.sin(M) + 0.5 * e * e * Math.sin(2 * M);

  const a = elements.semiMajorAxisKm;
  const xOrbital = a * (Math.cos(E) - e);
  const zOrbital = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const inc = THREE.MathUtils.degToRad(elements.inclinationDeg);
  const asc = THREE.MathUtils.degToRad(elements.ascendingNodeDeg);
  const arg = THREE.MathUtils.degToRad(elements.argumentOfPeriapsisDeg);

  outVector.set(xOrbital, 0, zOrbital);
  _orbitalEuler.set(inc, asc, arg, 'YXZ');
  outVector.applyEuler(_orbitalEuler);
  return outVector;
}

export const CELESTIAL_BODIES_CATALOG: CelestialTarget[] = [
  {
    id: 'mars',
    name: 'Sao Hỏa (Mars)',
    subtitle: 'Hành tinh thứ 4 tính từ Mặt Trời • Hệ Quỹ đạo Trung tâm',
    category: 'PLANET',
    position: new THREE.Vector3(0, 0, 0),
    radius: MARS_MEAN_RADIUS_KM,
    safeViewDistance: 10500,
    telemetry: {
      classification: 'Hành tinh đất đá (Terrestrial Planet)',
      meanTemperatureC: '-63 °C (-140 °C đến +20 °C)',
      atmosphericPressurePa: '610 Pa (95.3% CO₂, 2.6% N₂, 1.9% Ar)',
      surfaceGravityMs2: '3.721 m/s² (0.379 g)',
      orbitalVelocityKms: '24.07 km/s (Quanh Mặt Trời)',
      geologicalAge: '4.603 tỷ năm (Kỷ Noachian - Amazonian)',
      missionSummary:
        'Hành tinh đỏ sở hữu ngọn núi lửa lớn nhất Hệ Mặt Trời (Olympus Mons), hệ thống hẻm núi Valles Marineris dài 4.000 km và dấu tích sông hồ cổ đại tại Jezero Crater.',
      keyHighlights: [
        'Bán kính trung bình: 3.389,5 km • Độ nghiêng trục: 25,19°',
        'Độ dài ngày (Sol): 24 giờ 39 phút 35 giây',
        'Tán xạ bụi sắt(III) oxit tạo quầng khí quyển cam đỏ đặc trưng',
      ],
    },
  },
  {
    id: 'phobos',
    name: 'Phobos (Vệ tinh I)',
    subtitle: 'Vệ tinh tự nhiên lớn nhất & gần Sao Hỏa nhất',
    category: 'MOON',
    position: new THREE.Vector3(9376, 210, 0),
    radius: 140, // Phóng đại tỷ lệ hiển thị 3D hợp lý để quan sát trên quỹ đạo (bán kính thực 11.27 km)
    safeViewDistance: 620,
    modelPath: '/assets/models/moons/phobos_draco.glb',
    orbitalElements: {
      semiMajorAxisKm: 9376,
      eccentricity: 0.0151,
      inclinationDeg: 1.093,
      ascendingNodeDeg: 48.0,
      argumentOfPeriapsisDeg: 150.0,
      meanAnomalyAtEpochDeg: 15.0,
      orbitalPeriodHours: 7.6538,
    },
    telemetry: {
      classification: 'Vệ tinh tự nhiên dị hình (loại C/D giàu carbon)',
      meanTemperatureC: '-40 °C (ban ngày) đến -112 °C (ban đêm)',
      atmosphericPressurePa: '0 Pa (Chân không)',
      surfaceGravityMs2: '0.0057 m/s² (580 µg)',
      orbitalVelocityKms: '2.138 km/s',
      geologicalAge: '~4.3 tỷ năm (Bắt giữ hoặc hình thành từ đĩa va chạm)',
      missionSummary:
        'Quay quanh Sao Hỏa ở độ cao chỉ ~6.000 km trên bề mặt, nhanh hơn tốc độ tự quay của Sao Hỏa (mọc ở hướng Tây, lặn ở hướng Đông). Nổi bật với hố va chạm khổng lồ Stickney rộng 9 km.',
      keyHighlights: [
        'Kích thước thực: 27 × 22 × 18 km (Bán kính trung bình 11,27 km)',
        'Chu kỳ quỹ đạo cực ngắn: 7 giờ 39 phút',
        'Đang tiến sát Sao Hỏa 1,8 mét mỗi thế kỷ do lực thủy triều',
      ],
    },
  },
  {
    id: 'deimos',
    name: 'Deimos (Vệ tinh II)',
    subtitle: 'Vệ tinh tự nhiên vòng ngoài của Sao Hỏa',
    category: 'MOON',
    position: new THREE.Vector3(-23463, 420, 0),
    radius: 110, // Phóng đại tỷ lệ hiển thị 3D (bán kính thực 6.2 km)
    safeViewDistance: 500,
    modelPath: '/assets/models/moons/deimos_draco.glb',
    orbitalElements: {
      semiMajorAxisKm: 23463.2,
      eccentricity: 0.00033,
      inclinationDeg: 1.788,
      ascendingNodeDeg: 316.0,
      argumentOfPeriapsisDeg: 290.0,
      meanAnomalyAtEpochDeg: 195.0,
      orbitalPeriodHours: 30.312,
    },
    telemetry: {
      classification: 'Vệ tinh tự nhiên vòng ngoài ( Chondrite giàu carbon )',
      meanTemperatureC: '-40 °C trung bình',
      atmosphericPressurePa: '0 Pa (Chân không)',
      surfaceGravityMs2: '0.003 m/s² (300 µg)',
      orbitalVelocityKms: '1.351 km/s',
      geologicalAge: '~4.3 tỷ năm',
      missionSummary:
        'Bề mặt Deimos mượt hơn Phobos do các hố va chạm được lấp đầy bởi lớp bụi regolith dày. Hai hố va chạm lớn nhất mang tên Swift và Voltaire.',
      keyHighlights: [
        'Bán trục lớn quỹ đạo: 23.463,2 km',
        'Chu kỳ quỹ đạo: 30,31 giờ (Gần đồng bộ với Sol Sao Hỏa)',
        'Trạm trung chuyển lý tưởng cho các sứ mệnh thám hiểm không gian sâu',
      ],
    },
  },
  {
    id: 'mro_orbiter',
    name: 'Tàu Mars Reconnaissance Orbiter (MRO)',
    subtitle: 'Vệ tinh viễn thám độ phân giải cao của NASA (HiRISE / CRISM)',
    category: 'SPACECRAFT',
    position: new THREE.Vector3(0, 3100, 2100),
    radius: 55,
    safeViewDistance: 280,
    modelPath: '/assets/models/spacecraft/mars_reconnaissance_orbiter.glb',
    orbitalElements: {
      semiMajorAxisKm: 3740, // ~350 km trên bề mặt
      eccentricity: 0.002,
      inclinationDeg: 92.6, // Quỹ đạo cực đồng bộ Mặt Trời (Sun-synchronous polar orbit)
      ascendingNodeDeg: 24.0,
      argumentOfPeriapsisDeg: 90.0,
      meanAnomalyAtEpochDeg: 65.0,
      orbitalPeriodHours: 1.87,
    },
    telemetry: {
      classification: 'Tàu quỹ đạo viễn thám & Trạm chuyển tiếp liên lạc',
      meanTemperatureC: 'Hệ thống kiểm soát nhiệt chủ động (-20 °C đến +35 °C)',
      atmosphericPressurePa: 'Quỹ đạo tầm thấp (LEO-Mars ~300 km)',
      surfaceGravityMs2: 'Vi trọng lực (Free-fall orbital mechanics)',
      orbitalVelocityKms: '3.42 km/s',
      geologicalAge: 'Phóng ngày 12/08/2005 • Nhập quỹ đạo 10/03/2006',
      missionSummary:
        'Được trang bị kính viễn vọng HiRISE đường kính 0,5 m chụp ảnh bề mặt tới 30 cm/pixel và quang phổ kế CRISM lập bản đồ khoáng vật ngậm nước phục vụ chọn bãi đáp cho Perseverance.',
      keyHighlights: [
        'Độ cao quỹ đạo: 255 × 320 km (Quỹ đạo cực nghiêng 92,6°)',
        'Truyền tải hơn 450 Terabit dữ liệu khoa học về Trái Đất',
        'Đóng vai trò trạm chuyển tiếp UHF chính cho các Rover bề mặt',
      ],
    },
  },
  {
    id: 'ares_station',
    name: 'Trạm Không Gian Quỹ Đạo Ares',
    subtitle: 'Trạm trung chuyển & nghiên cứu quỹ đạo tầm trung (MOI Gateway)',
    category: 'SPACECRAFT',
    position: new THREE.Vector3(-4200, 1200, 2800),
    radius: 75,
    safeViewDistance: 340,
    modelPath: '/assets/models/stations/ares_orbital_station_lod0.glb',
    orbitalElements: {
      semiMajorAxisKm: 5200,
      eccentricity: 0.001,
      inclinationDeg: 28.5,
      ascendingNodeDeg: 140.0,
      argumentOfPeriapsisDeg: 45.0,
      meanAnomalyAtEpochDeg: 240.0,
      orbitalPeriodHours: 3.12,
    },
    telemetry: {
      classification: 'Trạm không gian mô-đun quay tạo trọng lực nhân tạo',
      meanTemperatureC: '+21.5 °C (Môi trường sống điều áp nội khoang)',
      atmosphericPressurePa: '101.3 kPa (Khí quyển nhân tạo N₂/O₂)',
      surfaceGravityMs2: '3.72 m/s² (Vòng ly tâm mô phỏng trọng lực Sao Hỏa)',
      orbitalVelocityKms: '2.89 km/s',
      geologicalAge: 'Trạm hạ tầng quỹ đạo thế hệ mới',
      missionSummary:
        'Trạm điều phối hạ cánh bề mặt, điều khiển từ xa theo thời gian thực (độ trễ < 20 ms) cho đội hình robot tự hành và tàu đổ bộ tại Jezero Crater và Tharsis.',
      keyHighlights: [
        'Độ cao quỹ đạo: 1.810 km trên xích đạo Sao Hỏa',
        'Hệ thống đẩy Hall-Effect Ion Thruster công suất 150 kW',
        'Cổng ghép nối kép cho tàu vận tải liên hành tinh & tàu đổ bộ',
      ],
    },
  },
];
