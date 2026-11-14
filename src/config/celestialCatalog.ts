import * as THREE from 'three';
import { BODY_CATALOG } from './bodyCatalog';
import type { BodyId, CelestialTarget, OrbitalElements, SourceReference } from '../types/cosmos.types';

export const MARS_MEAN_RADIUS_KM = 3389.5;
export const MARS_EQUATORIAL_RADIUS_KM = 3396.19;
export const MARS_POLAR_RADIUS_KM = 3376.2;
export const MARS_AXIAL_TILT_DEG = 25.19;
export const MARS_AXIAL_TILT_RAD = THREE.MathUtils.degToRad(MARS_AXIAL_TILT_DEG);
export const MARS_SIDEREAL_ROTATION_SECONDS = 88642.44;

export const MOON_MEAN_RADIUS_KM = 1737.4;
export const MOON_AXIAL_TILT_DEG = 6.68;
export const MOON_AXIAL_TILT_RAD = THREE.MathUtils.degToRad(MOON_AXIAL_TILT_DEG);

const _orbitalEuler = new THREE.Euler(0, 0, 0, 'YXZ');

/**
 * Computes the 3D orbital position around the active body center (1 scene unit = 1 km)
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

  const e = elements.eccentricity;
  const E = M + e * Math.sin(M) + 0.5 * e * e * Math.sin(2 * M);

  const a = elements.semiMajorAxisKm;
  const xOrbital = a * (Math.cos(E) - e);
  const zOrbital = a * Math.sqrt(Math.max(0.01, 1 - e * e)) * Math.sin(E);

  const inc = THREE.MathUtils.degToRad(elements.inclinationDeg);
  const asc = THREE.MathUtils.degToRad(elements.ascendingNodeDeg);
  const arg = THREE.MathUtils.degToRad(elements.argumentOfPeriapsisDeg);

  outVector.set(xOrbital, 0, zOrbital);
  _orbitalEuler.set(inc, asc, arg, 'YXZ');
  outVector.applyEuler(_orbitalEuler);
  return outVector;
}

export const CELESTIAL_BODIES_CATALOG: CelestialTarget[] = Object.values(BODY_CATALOG).map(
  (body) => body.target,
);

function nasaSource(title: string, url: string, version: string): SourceReference {
  return {
    title,
    url,
    checked: '2026-11-14',
    version,
  };
}

/**
 * Natural moons & artificial orbital actors around Mars and the Moon.
 * Orbital visualization radii near low orbits are given minimum display clearance
 * while retaining documented NASA semi-major axes and altitudes inside telemetry text.
 */
export const ORBITAL_ACTORS_CATALOG: CelestialTarget[] = [
  {
    id: 'phobos',
    bodyId: 'mars',
    name: 'Phobos (Vệ tinh I)',
    subtitle: 'Vệ tinh tự nhiên lớn nhất & gần Sao Hỏa nhất',
    category: 'MOON',
    position: new THREE.Vector3(9376, 180, 0),
    radius: 140, // Display-scaled for orbital visibility (documented mean radius ~11.27 km)
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
    source: nasaSource(
      'NASA Science · Phobos Facts',
      'https://science.nasa.gov/mars/moons/phobos/',
      'Documented orbital & physical parameters; mesh scaled for legibility',
    ),
    telemetry: {
      classification: 'Vệ tinh tự nhiên dị hình (loại C/D giàu carbon)',
      meanTemperatureC: '-40 °C (ban ngày) đến -112 °C (ban đêm)',
      atmosphericPressurePa: '0 Pa (Chân không)',
      surfaceGravityMs2: '0,0057 m/s² (~580 µg)',
      orbitalVelocityKms: '2,138 km/s',
      geologicalAge: '~4,3 tỷ năm',
      missionSummary:
        'Quay quanh Sao Hỏa ở bán trục lớn 9.376 km (~5.980 km trên bề mặt), nhanh hơn chu kỳ tự quay của Sao Hỏa (chu kỳ 7,65 giờ). Nổi bật với hố va chạm Stickney rộng ~9 km.',
      keyHighlights: [
        'Kích thước thực: ~27 × 22 × 18 km (bán kính hiển thị minh họa phóng đại trên quỹ đạo)',
        'Chu kỳ quỹ đạo: 7 giờ 39 phút · Độ nghiêng xích đạo: 1,093°',
        'Độ cao quỹ đạo gần khiến Phobos chịu lực thủy triều tiến dần về phía Sao Hỏa',
      ],
    },
  },
  {
    id: 'deimos',
    bodyId: 'mars',
    name: 'Deimos (Vệ tinh II)',
    subtitle: 'Vệ tinh tự nhiên vòng ngoài của Sao Hỏa',
    category: 'MOON',
    position: new THREE.Vector3(-23463, 420, 0),
    radius: 110, // Display-scaled for orbital visibility (documented mean radius ~6.2 km)
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
    source: nasaSource(
      'NASA Science · Deimos Facts',
      'https://science.nasa.gov/mars/moons/deimos/',
      'Documented orbital & physical parameters; mesh scaled for legibility',
    ),
    telemetry: {
      classification: 'Vệ tinh tự nhiên vòng ngoài ( Chondrite giàu carbon )',
      meanTemperatureC: '-40 °C (ước tính trung bình)',
      atmosphericPressurePa: '0 Pa (Chân không)',
      surfaceGravityMs2: '0,003 m/s² (~300 µg)',
      orbitalVelocityKms: '1,351 km/s',
      geologicalAge: '~4,3 tỷ năm',
      missionSummary:
        'Quỹ đạo vòng ngoài có bán trục lớn 23.463,2 km với độ lệch tâm rất nhỏ (0,00033). Bề mặt mượt hơn Phobos nhờ lớp bụi regolith phủ dày quanh hai hố lớn Swift và Voltaire.',
      keyHighlights: [
        'Bán trục lớn: 23.463,2 km · Chu kỳ quỹ đạo: 30,31 giờ',
        'Kích thước thực ~15 × 12 × 10 km (bán kính hiển thị minh họa trên quỹ đạo)',
        'Quỹ đạo gần như tròn quanh mặt phẳng xích đạo Sao Hỏa',
      ],
    },
  },
  {
    id: 'mro_orbiter',
    bodyId: 'mars',
    name: 'Tàu Mars Reconnaissance Orbiter (MRO)',
    subtitle: 'Tàu quỹ đạo viễn thám HiRISE / CRISM · Quỹ đạo cực',
    category: 'SPACECRAFT',
    position: new THREE.Vector3(0, 3950, 0),
    radius: 85,
    safeViewDistance: 460,
    modelPath: '/assets/models/mars/mro_orbiter.glb',
    orbitalElements: {
      semiMajorAxisKm: 3980, // ~590 km display clearance above surface (actual 255x320 km)
      eccentricity: 0.002,
      inclinationDeg: 92.6,
      ascendingNodeDeg: 24.0,
      argumentOfPeriapsisDeg: 90.0,
      meanAnomalyAtEpochDeg: 65.0,
      orbitalPeriodHours: 1.87,
    },
    source: nasaSource(
      'NASA Science · Mars Reconnaissance Orbiter (MRO)',
      'https://science.nasa.gov/mission/mars-reconnaissance-orbiter/',
      'Mission parameters & NASA 3D Resource MRO GLB',
    ),
    telemetry: {
      classification: 'Tàu quỹ đạo viễn thám & Trạm chuyển tiếp liên lạc',
      meanTemperatureC: 'Kiểm soát nhiệt chủ động',
      atmosphericPressurePa: 'Quỹ đạo cực thấp Sao Hỏa (~255 × 320 km)',
      surfaceGravityMs2: 'Quỹ đạo rơi tự do',
      orbitalVelocityKms: '~3,42 km/s',
      geologicalAge: 'Phóng 12/08/2005 · Nhập quỹ đạo 10/03/2006',
      missionSummary:
        'Trang bị kính thiên văn HiRISE và quang phổ kế CRISM lập bản đồ khoáng vật, bãi đáp cho các xe tự hành và làm trạm chuyển tiếp UHF chính.',
      keyHighlights: [
        'Quỹ đạo thực 255 × 320 km nghiêng 92,6° (nâng nhẹ bán kính trên bản đồ 3D để tránh cắt bề mặt)',
        'Có sẵn mô hình 3D MRO chuẩn NASA GLB ở Lựa chọn 1',
        'Có góc nhìn khoang viễn thám HiRISE hướng xuống bề mặt ở Lựa chọn 2',
      ],
    },
  },
  {
    id: 'mars_odyssey',
    bodyId: 'mars',
    name: 'Tàu 2001 Mars Odyssey',
    subtitle: 'Tàu quỹ đạo đo phổ hồng ngoại THEMIS · Quỹ đạo cực',
    category: 'SPACECRAFT',
    position: new THREE.Vector3(-4050, 420, 0),
    radius: 75,
    safeViewDistance: 460,
    orbitalElements: {
      semiMajorAxisKm: 4080, // Actual ~400 km altitude Sun-synchronous
      eccentricity: 0.003,
      inclinationDeg: 93.1,
      ascendingNodeDeg: 112.0,
      argumentOfPeriapsisDeg: 180.0,
      meanAnomalyAtEpochDeg: 210.0,
      orbitalPeriodHours: 1.97,
    },
    source: nasaSource(
      'NASA Science · 2001 Mars Odyssey',
      'https://science.nasa.gov/mission/odyssey/',
      'Mission telemetry summary & Sun-synchronous polar profile',
    ),
    telemetry: {
      classification: 'Tàu quỹ đạo lập bản đồ nhiệt hồng ngoại & hydro (Minh họa)',
      meanTemperatureC: 'Kiểm soát nhiệt tàu vũ trụ',
      atmosphericPressurePa: 'Quỹ đạo tầm thấp (~400 km trên bề mặt)',
      surfaceGravityMs2: 'Quỹ đạo rơi tự do',
      orbitalVelocityKms: '~3,38 km/s',
      geologicalAge: 'Phóng 07/04/2001 · Nhập quỹ đạo 24/10/2001',
      missionSummary:
        'Tàu quỹ đạo hoạt động lâu bền nhất quanh Sao Hỏa, mang camera ảnh nhiệt THEMIS và quang phổ kế tia gamma phát hiện dấu hiệu băng nước gần cực.',
      keyHighlights: [
        'Quỹ đạo đồng bộ Mặt Trời nghiêng ~93,1°, chu kỳ gần 2 giờ',
        'Hình khối trên quỹ đạo là tàu quỹ đạo minh họa theo hồ sơ sứ mệnh NASA',
        'Hỗ trợ góc nhìn cảm biến nhiệt & lưới toàn cầu ở Lựa chọn 2',
      ],
    },
  },
  {
    id: 'maven_orbiter',
    bodyId: 'mars',
    name: 'Tàu quỹ đạo MAVEN',
    subtitle: 'Nghiên cứu tầng khí quyển trên & thoát khí · Quỹ đạo elip',
    category: 'SPACECRAFT',
    position: new THREE.Vector3(0, 2900, 4600),
    radius: 78,
    safeViewDistance: 520,
    orbitalElements: {
      semiMajorAxisKm: 5600,
      eccentricity: 0.31, // Illustrative elliptical display geometry inspired by MAVEN's elliptical science orbit
      inclinationDeg: 75.0,
      ascendingNodeDeg: 205.0,
      argumentOfPeriapsisDeg: 35.0,
      meanAnomalyAtEpochDeg: 310.0,
      orbitalPeriodHours: 3.6,
    },
    source: nasaSource(
      'NASA Science · MAVEN',
      'https://science.nasa.gov/mission/maven/',
      'Mission profile & elliptical upper-atmosphere survey orbit',
    ),
    telemetry: {
      classification: 'Tàu quỹ đạo khảo sát tầng điện ly & gió Mặt Trời (Minh họa)',
      meanTemperatureC: 'Môi trường tầng điện ly',
      atmosphericPressurePa: 'Quỹ đạo elip ~150 × 4.500 km (rút gọn sau 2019)',
      surfaceGravityMs2: 'Quỹ đạo rơi tự do',
      orbitalVelocityKms: 'Biến thiên theo elip Kepler',
      geologicalAge: 'Phóng 18/11/2013 · Nhập quỹ đạo 21/09/2014',
      missionSummary:
        'Khảo sát cơ chế thất thoát khí quyển Sao Hỏa vào không gian do gió Mặt Trời và kiêm nhiệm chuyển tiếp liên lạc cho đội hình xe tự hành bề mặt.',
      keyHighlights: [
        'Quỹ đạo elip nghiêng ~75° cắt sâu qua tầng khí quyển trên gần cận điểm',
        'Hình dạng tàu & elip hiển thị mang tính minh họa trực quan trong scene',
        'Xem góc nhìn quỹ đạo tầng trên khí quyển ở Lựa chọn 2',
      ],
    },
  },
  {
    id: 'dawn_flyby',
    bodyId: 'mars',
    name: 'Tàu Dawn (Hỗ trợ hấp dẫn 2009)',
    subtitle: 'Tàu đẩy ion · Bay ngang Sao Hỏa hỗ trợ hấp dẫn tới Vesta & Ceres',
    category: 'SPACECRAFT',
    position: new THREE.Vector3(6200, -1400, 3200),
    radius: 82,
    safeViewDistance: 460,
    modelPath: '/assets/models/mars/dawn_spacecraft.glb',
    orbitalElements: {
      semiMajorAxisKm: 7400,
      eccentricity: 0.14,
      inclinationDeg: 42.0,
      ascendingNodeDeg: 292.0,
      argumentOfPeriapsisDeg: 115.0,
      meanAnomalyAtEpochDeg: 120.0,
      orbitalPeriodHours: 5.4,
    },
    source: nasaSource(
      'NASA Science · Dawn Mission & Mars Gravity Assist (Feb 2009)',
      'https://science.nasa.gov/mission/dawn/',
      'Historical 2009 Mars gravity assist flyby reference & NASA 3D GLB',
    ),
    telemetry: {
      classification: 'Tàu thăm dò động cơ ion (Đường bay minh họa qua quỹ đạo Sao Hỏa)',
      meanTemperatureC: 'Không gian liên hành tinh',
      atmosphericPressurePa: 'Bay ngang độ cao tối thiểu ~549 km (ngày 17/02/2009)',
      surfaceGravityMs2: 'Quỹ đạo flyby lịch sử (vòng lặp minh họa quanh Sao Hỏa)',
      orbitalVelocityKms: 'Tăng tốc nhờ trường hấp dẫn Sao Hỏa',
      geologicalAge: 'Bay ngang Sao Hỏa: 17/02/2009',
      missionSummary:
        'Tàu Dawn thực hiện cơ động hỗ trợ hấp dẫn quanh Sao Hỏa tháng 02/2009 để bẻ mặt phẳng quỹ đạo và tiến vào vành đai tiểu hành tinh thăm Vesta và Ceres.',
      keyHighlights: [
        'Tích hợp mô hình 3D thật (dawn_spacecraft.glb) từ kho NASA 3D Resources',
        'Vòng quỹ đạo quanh Sao Hỏa trong app là cung minh họa cho sự kiện flyby 2009',
        'Có thể chuyển Lựa chọn 1 (Soi mô hình Dawn 3D) hoặc Lựa chọn 2 (Góc nhìn Cupola)',
      ],
    },
  },
  {
    id: 'ares_station',
    bodyId: 'mars',
    name: 'Trạm Quỹ Đạo Ares (Khái niệm)',
    subtitle: 'Trạm trung chuyển ly tâm giả lập (MOI Gateway · Minh họa)',
    category: 'SPACECRAFT',
    position: new THREE.Vector3(-4200, 1200, 2800),
    radius: 90,
    safeViewDistance: 480,
    orbitalElements: {
      semiMajorAxisKm: 5200,
      eccentricity: 0.001,
      inclinationDeg: 28.5,
      ascendingNodeDeg: 140.0,
      argumentOfPeriapsisDeg: 45.0,
      meanAnomalyAtEpochDeg: 240.0,
      orbitalPeriodHours: 3.12,
    },
    source: nasaSource(
      'Mars Orbital Atlas · Illustrative Orbital Gateway Architecture',
      'https://science.nasa.gov/mars/',
      'Conceptual orbital habitat visualization; non-historic mission',
    ),
    telemetry: {
      classification: 'Mô-đun khái niệm minh họa (Không phải tàu lịch sử đã phóng)',
      meanTemperatureC: '+21 °C (Khoang điều áp giả lập)',
      atmosphericPressurePa: 'Quỹ đạo tầm trung ~1.810 km (minh họa)',
      surfaceGravityMs2: 'Vòng quay ly tâm minh họa',
      orbitalVelocityKms: '~2,89 km/s',
      geologicalAge: 'Khái niệm hạ tầng quỹ đạo trong Atlas',
      missionSummary:
        'Trạm quỹ đạo khái niệm đóng vai trò điểm ngắm toàn cảnh Sao Hỏa và khoang điều khiển từ trên cao (Cupola POV) cho đội tàu thám hiểm.',
      keyHighlights: [
        'Ghi chú rõ: đây là đối tượng minh họa kiến trúc trạm không gian, không phải nhiệm vụ NASA thật',
        'Quỹ đạo tầm trung 5.200 km tạo góc nhìn bao quát cả Phobos và Sao Hỏa',
        'Mở Lựa chọn 2 để vào buồng ngắm Cupola nhìn xuống Sao Hỏa tự quay',
      ],
    },
  },
  {
    id: 'lro_orbiter',
    bodyId: 'moon',
    name: 'Lunar Reconnaissance Orbiter (LRO)',
    subtitle: 'Tàu quỹ đạo lập bản đồ LROC & LOLA · Quỹ đạo cực Mặt Trăng',
    category: 'SPACECRAFT',
    position: new THREE.Vector3(0, 2150, 0),
    radius: 56,
    safeViewDistance: 320,
    orbitalElements: {
      semiMajorAxisKm: 2120, // Display clearance above 1737.4 km radius (actual ~50-200 km altitude)
      eccentricity: 0.004,
      inclinationDeg: 89.2,
      ascendingNodeDeg: 35.0,
      argumentOfPeriapsisDeg: 90.0,
      meanAnomalyAtEpochDeg: 35.0,
      orbitalPeriodHours: 1.88,
    },
    source: nasaSource(
      'NASA Science · Lunar Reconnaissance Orbiter (LRO)',
      'https://science.nasa.gov/mission/lro/',
      'Polar mapping mission profile & orbital parameters',
    ),
    telemetry: {
      classification: 'Tàu quỹ đạo lập bản đồ độ cao LOLA & ảnh LROC (Minh họa 3D)',
      meanTemperatureC: 'Kiểm soát nhiệt chủ động',
      atmosphericPressurePa: 'Quỹ đạo cực Mặt Trăng (~50–200 km trên bề mặt)',
      surfaceGravityMs2: 'Quỹ đạo rơi tự do',
      orbitalVelocityKms: '~1,68 km/s',
      geologicalAge: 'Phóng 18/06/2009 · Nhập quỹ đạo 23/06/2009',
      missionSummary:
        'Lập bản đồ địa hình Mặt Trăng bằng máy đo cao laser LOLA và camera LROC phân giải cao, quan sát vùng cực tối vĩnh cửu và các bãi đáp Apollo.',
      keyHighlights: [
        'Quỹ đạo cực gần 90° bay qua vùng cực Nam Mặt Trăng mỗi ~113 phút',
        'Bán kính hiển thị quỹ đạo được nâng nhẹ trong Atlas để tránh cắt mặt cầu Mặt Trăng',
        'Có thể xem mô hình minh họa (Lựa chọn 1) hoặc góc nhìn LROC nadir (Lựa chọn 2)',
      ],
    },
  },
  {
    id: 'apollo_csm',
    bodyId: 'moon',
    name: 'Apollo Command/Service Module (CSM)',
    subtitle: 'Mô-đun chỉ huy quỹ đạo Mặt Trăng · Hồ sơ sứ mệnh Apollo',
    category: 'SPACECRAFT',
    position: new THREE.Vector3(-2320, 120, 0),
    radius: 58,
    safeViewDistance: 340,
    orbitalElements: {
      semiMajorAxisKm: 2340, // Display clearance above 1737.4 km radius (actual ~110 km altitude)
      eccentricity: 0.002,
      inclinationDeg: 18.0,
      ascendingNodeDeg: 155.0,
      argumentOfPeriapsisDeg: 25.0,
      meanAnomalyAtEpochDeg: 145.0,
      orbitalPeriodHours: 2.0,
    },
    source: nasaSource(
      'NASA NTRS · Apollo Command/Service Module Lunar Orbit Profile',
      'https://www.nasa.gov/history/alsj/',
      'Historic Apollo lunar orbit ~60 nmi circular benchmark (illustrative 3D orbit)',
    ),
    telemetry: {
      classification: 'Tàu quỹ đạo chỉ huy lịch sử (Minh họa quỹ đạo · không có GLB riêng)',
      meanTemperatureC: 'Khoang phi hành đoàn điều áp',
      atmosphericPressurePa: 'Quỹ đạo Mặt Trăng gần ~110 km (60 hải lý)',
      surfaceGravityMs2: 'Quỹ đạo rơi tự do',
      orbitalVelocityKms: '~1,63 km/s',
      geologicalAge: 'Chương trình Apollo (1968–1972)',
      missionSummary:
        'Duy trì trên quỹ đạo Mặt Trăng trong lúc mô-đun LM đáp xuống bề mặt; thực hiện điểm hẹn và ghép nối quỹ đạo sau khi hoàn thành khảo sát với LRV.',
      keyHighlights: [
        'Chu kỳ quỹ đạo ~2 giờ quanh Mặt Trăng ở độ cao danh nghĩa ~110 km',
        'Hình khối trên cảnh 3D là minh họa trực quan (không kèm tệp NASA CAD GLB)',
        'Mở Lựa chọn 2 để quan sát Mặt Trăng từ cửa sổ khoang chỉ huy',
      ],
    },
  },
];

export const LINKED_ORBITAL_DEVICE_IDS: Record<string, string> = {
  mro_orbiter: 'mro_orbiter',
  dawn_flyby: 'dawn_spacecraft',
};

export function getOrbitalActorsForBody(bodyId: BodyId): CelestialTarget[] {
  return ORBITAL_ACTORS_CATALOG.filter((actor) => actor.bodyId === bodyId);
}
