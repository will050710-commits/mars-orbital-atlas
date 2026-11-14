import type {
  DeviceControlSpec,
  DevicePartGroupId,
} from '../types/cosmos.types';

export const INSIGHT_PANEL_LEFT_NODES = [
  'panel_l_rod',
  'Cube.046',
  'Cube.001',
  'Cube.047',
  'Cube.048',
  'Cube.049',
  'Cube.050',
  'Cube.051',
  'Cube.052',
  'Cube.056',
  'Cube.057',
  'Cube.054',
  'Cube.055',
  'Cube.053',
  'panel_l.033',
  'panel_l.032',
  'panel_l.031',
  'panel_l.021',
  'panel_l.020',
  'Cube.064',
  'Cube.065',
  'Cube.062',
  'Cube.063',
  'Cube.060',
  'Cube.061',
  'Cube.058',
  'Cube.059',
  'panel_l.037',
  'panel_l.036',
  'panel_l.035',
  'panel_l.034',
  'panel_l.019',
  'panel_l.004',
  'panel_l_root',
] as const;

export const INSIGHT_PANEL_RIGHT_NODES = [
  'panel_r_rod',
  'Cube.002',
  'Cube.079',
  'Cube.080',
  'Cube.067',
  'Cube.081',
  'Cube.082',
  'Cube.068',
  'Cube.083',
  'Cube.084',
  'Cube.069',
  'Cube.085',
  'Cube.086',
  'Cube.070',
  'Cube.097',
  'Cube.066',
  'Cube.095',
  'Cube.096',
  'Cube.075',
  'Cube.093',
  'Cube.094',
  'Cube.074',
  'Cube.091',
  'Cube.092',
  'Cube.073',
  'Cube.089',
  'Cube.090',
  'Cube.072',
  'Cube.087',
  'Cube.088',
  'Cube.071',
  'Cube.026',
  'Cube.078',
  'panel_r_root',
] as const;

export const INSIGHT_ARM_NODES = [
  'arm_01',
  'arm_02',
  'arm_03',
  'arm_03.001',
  'IDC',
  'lens_cap_IDC',
  'knob',
  'shovel',
] as const;

export const INSIGHT_GRAPPLE_NODES = [
  'grapple',
  'claw_01',
  'claw_02',
  'claw_03',
  'claw_04',
  'claw_05',
] as const;

export const INSIGHT_ALL_NODES = [
  ...INSIGHT_GRAPPLE_NODES,
  'IDC',
  'knob',
  'lens_cap_IDC',
  'shovel',
  'arm_03',
  'arm_03.001',
  'arm_02',
  'arm_01',
  ...INSIGHT_PANEL_LEFT_NODES,
  ...INSIGHT_PANEL_RIGHT_NODES,
  'InSight_Deployed',
] as const;

export const INGENUITY_ALL_NODES = [
  'bus',
  'cams',
  'leg_01',
  'leg_02',
  'leg_03',
  'leg_04',
  'parts_01',
  'parts_02',
  'rotors_01',
  'rotors_02',
  'solar_panel',
] as const;

export const PERSEVERANCE_MAST_OPTICS_NODES = [
  'head',
  'lens',
  'Mastcam_Z_cams',
  'NavCams',
  'microphones.001',
  'probe',
  'probe.001',
  'base',
  'top',
  'bottom',
  'bottom.001',
  'bottom.002',
  'bottom.003',
  'Up_Look_Camera',
  'Down_Look_Camera',
  'calibration_target',
  'calibration_target_bracket',
] as const;

export const PERSEVERANCE_ARM_TURRET_NODES = [
  'arm.003',
  'arm.002',
  'arm',
  'arm.004',
  'arm.001',
  'arm_cable_etc',
  'turret_obj',
  'turret_obj.002',
  'turret_obj.004',
  'turret_obj.006',
  'turret_parts',
  'corring_drill',
  'cover_02',
  'cover_03',
  'hinge',
  'PIXL_cover_01',
  'PIXL',
  'WATSON',
  'arm_01_joint',
  'arm_01_pivot',
  'arm_01',
  'arm_02_joint',
  'arm_02_pivot',
  'arm_02',
  'arm_02.001',
] as const;

export const PERSEVERANCE_POWER_COMMS_NODES = [
  'rtg',
  'antenna_uhf',
  'antenna_hg',
  'antenna_lg',
  'RIMFAX',
  'Name_Chips',
  'pan_end cover',
] as const;

export const PERSEVERANCE_CHASSIS_MOBILITY_NODES = [
  'Wheels_objs',
  'suspension',
  'Body',
  'Body.002',
  'Body.003',
  'Body_Parts',
  'Body_Parts.001',
  'part_01',
  'box',
  'lab',
  'hazcams_front',
  'hazcams_front_cover',
  'hazcams_rear',
  'hazcams_rear_cover_l',
  'hazcams_rear_cover_r',
  'hazcams_rear_wiring',
  'microphones',
] as const;

export const PERSEVERANCE_ALL_NODES = [
  ...PERSEVERANCE_MAST_OPTICS_NODES,
  ...PERSEVERANCE_ARM_TURRET_NODES,
  ...PERSEVERANCE_POWER_COMMS_NODES,
  ...PERSEVERANCE_CHASSIS_MOBILITY_NODES,
] as const;

export const CURIOSITY_ALL_NODES = ['MSL'] as const;

/**
 * Verified source-backed inspection & limited mechanism specs.
 * `ingenuity_helicopter` (11 nodes), `insight_lander` (83 nodes),
 * `perseverance_rover` (66 nodes), and `curiosity_rover` (1 static MSL node)
 * have GLB hierarchies verified against official NASA/JPL documentation.
 */
export const DEVICE_CONTROL_SPECS: Record<string, DeviceControlSpec> = {
  ingenuity_helicopter: {
    deviceId: 'ingenuity_helicopter',
    modelVersion: '1.0.0 (NASA/JPL-Caltech GLB · fit-longest-side-2)',
    generalDisclaimer:
      'Góc nhìn và mô phỏng quay chậm là minh họa cấu trúc theo GLB chuẩn hóa 2 đơn vị; không mô phỏng khí động lực học hay telemetry bay thật.',
    rotorControl: {
      upperNodeName: 'rotors_01',
      lowerNodeName: 'rotors_02',
      localAxis: [1, 0, 0],
      documentedRpm: '~2.400 rpm (tốc độ thiết kế theo NASA Fact Sheet)',
      documentedDiameter: '1,21 m (rotor đồng trục 4 lá sợi carbon)',
      documentedFlightWindow: 'Tối đa ~90 giây/chuyến bay (NASA Rotor Geometry)',
      demoSpinRadPerSec: Math.PI, // 0.5 rev/s visual rate so counter-rotation stays legible on 60 Hz displays
      demoRevPerSecLabel: '0,5 vòng/giây (chỉ để quan sát chiều quay ngược, không phải 2.400 rpm thật)',
      stepAnglesDeg: [0, 45, 90, 180],
      disclaimer:
        'Hai node rotors_01 và rotors_02 có trục cục bộ [1, 0, 0] ngược dấu (+Y và -Y thế giới), nên quay ngược chiều quanh trục cột chính. Không giả lập góc pitch lá cánh (collective/cyclic) do GLB không tách thanh truyền pitch.',
    },
    cameraViews: [
      {
        id: 'overview',
        label: 'Toàn cảnh 3/4',
        position: [2.4, 1.25, 2.4],
        target: [0, 0, 0],
        summary:
          'Góc quan sát toàn bộ 11 node của trực thăng: solar_panel, 2 tầng rotor đồng trục, thân hộp bus (1,8 kg) và 4 chân đáp.',
        sourceRef: 'NASA Ingenuity Fact Sheet & NASA 3D Resource GLB',
        isIllustrativeView: true,
      },
      {
        id: 'coaxial_mast',
        label: 'Cụm Rotor & Pin mặt trời',
        position: [1.35, 0.42, 1.35],
        target: [0, 0.24, 0],
        summary:
          'Cận cảnh mảng pin mặt trời trên đỉnh (solar_panel), rotor trên/dưới (rotors_01, rotors_02 · sải 1,21 m) và hai cụm trục (parts_01, parts_02).',
        sourceRef: 'NASA Ingenuity Rotor Geometry & Fact Sheet',
        isIllustrativeView: true,
      },
      {
        id: 'rte_horizon',
        label: 'Camera màu RTE (13 MP · Ngang)',
        position: [0.68, -0.34, 0.22],
        target: [0.06, -0.22, 0],
        summary:
          'Đặt thấp hơn mép dưới thân hộp (+X, giữa hai chân leg_03/leg_04) hướng vào cụm quang học cams mô tả camera màu 13 MP nhìn chân trời.',
        sourceRef: 'NASA Ingenuity Landing Press Kit (RTE 13 MP camera)',
        isIllustrativeView: true,
      },
      {
        id: 'navcam_nadir',
        label: 'Camera Navcam (0,5 MP · Xuống)',
        position: [0.08, -0.92, 0.38],
        target: [0.03, -0.24, 0],
        summary:
          'Nhìn từ khoảng sáng gầm bên dưới (~13 cm thực tế) hướng lên cụm cảm biến cams và mặt đáy hộp bus chứa Navcam 0,5 MP đen trắng & laser altimeter.',
        sourceRef: 'NASA Ingenuity Landing Press Kit & Hover Modeling',
        isIllustrativeView: true,
      },
    ],
    partGroups: [
      {
        id: 'all',
        label: 'Tất cả cấu phần (11 node)',
        nodeNames: [...INGENUITY_ALL_NODES],
        documentedSpec:
          'Khối lượng 1,8 kg trên Trái Đất (~0,68 kg trên Sao Hỏa); cao 0,49 m; rotor đồng trục 1,21 m.',
        sourceRef: 'NASA Ingenuity Fact Sheet · /assets/provenance/ingenuity.csv',
        limitationNote:
          'Hiển thị toàn bộ 11 node theo tư thế tĩnh đã triển khai chân đáp; kích thước chuẩn hóa 2 đơn vị cảnh.',
        isControlVerified: true,
      },
      {
        id: 'rotor_system',
        label: 'Hệ Rotor đồng trục (rotors_01/02)',
        nodeNames: ['rotors_01', 'rotors_02', 'parts_01', 'parts_02'],
        documentedSpec:
          '2 tầng rotor quay ngược chiều đường kính 1,21 m bằng sợi carbon, tốc độ thiết kế ~2.400 rpm (tương thích parts_01, parts_02).',
        sourceRef: 'NASA Ingenuity Fact Sheet & Rotor Geometry',
        limitationNote:
          'Hỗ trợ xoay từng nấc 0°/45°/90°/180° và quay ngược chiều minh họa cho rotors_01 & rotors_02; khớp đĩa nghiêng (parts_01/02) giữ tĩnh.',
        isControlVerified: true,
      },
      {
        id: 'solar_power',
        label: 'Pin mặt trời & Ăng-ten (solar_panel)',
        nodeNames: ['solar_panel'],
        documentedSpec:
          'Mảng tế bào quang điện gắn trên đỉnh trục rotor để sạc 6 cell pin Li-ion, kèm cột ăng-ten liên lạc phía trên.',
        sourceRef: 'NASA Ingenuity Rotor Geometry & Fact Sheet',
        limitationNote:
          'Cụm cố định trong mô hình GLB; không giả lập dung lượng pin hay cường độ bức xạ theo giờ Sao Hỏa.',
        isControlVerified: false,
      },
      {
        id: 'fuselage_avionics',
        label: 'Thân hộp Avionics & Cảm biến (bus)',
        nodeNames: ['bus'],
        documentedSpec:
          'Hộp thân giữ nhiệt kích thước 13,6 × 19,5 × 16,3 cm chứa máy tính bay, IMU, bộ xử lý tự chủ và cổng đo cao laser ở mặt đáy.',
        sourceRef: 'NASA Ingenuity Landing Press Kit & Hover Modeling',
        limitationNote:
          'Khối hộp cố định (1 node gộp lớp vỏ bạc/carbon và đĩa đáy); không có telemetry nhiệt độ hay IMU thời gian thực.',
        isControlVerified: false,
      },
      {
        id: 'cameras_optics',
        label: 'Cụm Camera RTE & Navcam (cams)',
        nodeNames: ['cams'],
        documentedSpec:
          'Gồm camera dẫn đường hướng xuống (Navcam 0,5 MP đen trắng) và camera màu hướng chân trời (RTE 13 MP).',
        sourceRef: 'NASA Ingenuity Landing Press Kit',
        limitationNote:
          'Vị trí cụm ống kính cố định ở mép dưới trước thân hộp; không có góc xoay gimbal hay nguồn ảnh thực từ cảm biến.',
        isControlVerified: false,
      },
      {
        id: 'landing_gear',
        label: '4 Chân đáp Carbon (leg_01–04)',
        nodeNames: ['leg_01', 'leg_02', 'leg_03', 'leg_04'],
        documentedSpec:
          '4 chân đáp bằng vật liệu composite carbon, khoảng sáng gầm ~13 cm khi đứng trên bề mặt.',
        sourceRef: 'NASA Ingenuity Landing Press Kit & Hover Modeling',
        limitationNote:
          'Giữ nguyên tư thế đã bung (deployed). Không tạo animation gập chân vì trục local của node không phải bản lề và thiếu góc gập có nguồn.',
        isControlVerified: false,
      },
    ],
    sources: [
      {
        title: 'NASA Provenance CSV · Ingenuity Notes',
        url: '/assets/provenance/ingenuity.csv',
        checked: '2026-11-14',
        version: 'Supplied project provenance (Fact Sheet, Rotor Geometry, Landing Press Kit, Hover Modeling)',
      },
      {
        title: 'NASA 3D Resources · Ingenuity Mars Helicopter',
        url: 'https://science.nasa.gov/3d-resources/ingenuity-mars-helicopter/',
        checked: '2026-11-14',
        version: 'Supplied ZIP original GLB bytes',
      },
    ],
  },
  insight_lander: {
    deviceId: 'insight_lander',
    modelVersion: '1.0.0 (NASA/JPL-Caltech GLB · fit-longest-side-2 · 83 nodes)',
    generalDisclaimer:
      'Góc nhìn và phân nhóm 83 node của InSight được đối chiếu trên hình học GLB chuẩn hóa; cánh tay IDA giữ tư thế tĩnh triển khai và không giả lập động lực học hay telemetry địa chấn thật.',
    cameraViews: [
      {
        id: 'overview',
        label: 'Toàn cảnh tàu đổ bộ',
        position: [2.5, 1.35, 2.5],
        target: [0, 0, 0],
        summary:
          'Góc nhìn bao quát toàn bộ 83 node của tàu InSight ở cấu hình đã bung hai cánh pin mặt trời Ultraflex tròn đường kính ~2,15 m.',
        sourceRef: 'NASA InSight Launch Press Kit & NASA 3D Resource GLB',
        isIllustrativeView: true,
      },
      {
        id: 'arm_grapple',
        label: 'Cánh tay IDA & Móc Grapple',
        position: [1.15, 0.58, 1.32],
        target: [0.1, 0.05, 0.25],
        summary:
          'Cận cảnh cánh tay robot Instrument Deployment Arm (arm_01–arm_03), camera IDC, gầu múc (shovel) và móc 5 ngón grapple (claw_01–05).',
        sourceRef: 'NASA InSight Instrument Deployment System Fact Sheet',
        isIllustrativeView: true,
      },
      {
        id: 'solar_wings',
        label: 'Hai cánh Pin Ultraflex (2,15 m)',
        position: [0.1, 1.9, 1.75],
        target: [0, 0, 0],
        summary:
          'Góc nhìn từ trên xuống hai mảng pin hình quạt kép (panel_l_root / panel_r_root) gồm 68 node thanh giằng và cánh pin.',
        sourceRef: 'NASA InSight Spacecraft Overview (Lockheed Martin)',
        isIllustrativeView: true,
      },
      {
        id: 'deck_overview',
        label: 'Boong tàu & Cảm biến SEIS/HP³',
        position: [-1.1, 0.72, 1.15],
        target: [0, -0.05, 0],
        summary:
          'Soi thân chính InSight_Deployed nơi gắn khoang điện tử giữ nhiệt, ăng-ten UHF/X-band RISE và cụm khung thiết bị địa vật lý.',
        sourceRef: 'NASA InSight Mission Press Kit & GLB Mesh Inspection',
        isIllustrativeView: true,
      },
    ],
    partGroups: [
      {
        id: 'all',
        label: 'Toàn bộ cấu trúc (83 node)',
        nodeNames: [...INSIGHT_ALL_NODES],
        documentedSpec:
          'Khối lượng phóng ~358 kg (chỉ tàu đổ bộ); sải cánh ~6,0 m khi bung hai mảng pin Ultraflex trên mặt đất Elysium Planitia.',
        sourceRef: 'NASA InSight Spacecraft Fact Sheet',
        limitationNote:
          'Hiển thị toàn bộ 83 node theo cấu hình đã triển khai sau hạ cánh; tỉ lệ chuẩn hóa fit-longest-side-2.',
        isControlVerified: true,
      },
      {
        id: 'robotic_arm',
        label: 'Cánh tay IDA & Camera IDC',
        nodeNames: [...INSIGHT_ARM_NODES],
        documentedSpec:
          'Cánh tay robot dài ~1,8 m (4 bậc tự do) mang camera màu IDC, nắp ống kính (lens_cap_IDC) và gầu đất (shovel).',
        sourceRef: 'NASA JPL InSight Robotic Arm Overview',
        limitationNote:
          'Tĩnh trong phiên bản GLB chuẩn hóa; chưa hiệu chuẩn tâm khớp vai/khuỷu từng segment nên không tạo animation xoay khớp tự ý.',
        isControlVerified: false,
      },
      {
        id: 'grapple_claw',
        label: 'Móc kẹp 5 ngón (Grapple)',
        nodeNames: [...INSIGHT_GRAPPLE_NODES],
        documentedSpec:
          'Cơ cấu móc 5 ngón thụ động (grapple, claw_01–claw_05) dùng để nhấc máy đo địa chấn SEIS và mũi khoan nhiệt HP³ xuống bề mặt.',
        sourceRef: 'NASA InSight Instrument Deployment System',
        limitationNote:
          'Giữ nguyên tư thế tĩnh; cáp tời và độ giãn dây treo không tách riêng khỏi node grapple.',
        isControlVerified: false,
      },
      {
        id: 'solar_wings',
        label: 'Hai cánh Pin Ultraflex',
        nodeNames: [...INSIGHT_PANEL_LEFT_NODES, ...INSIGHT_PANEL_RIGHT_NODES],
        documentedSpec:
          'Hai cánh pin mặt trời bung xòe hình đĩa 10 cạnh đường kính ~2,15 m mỗi bên, tổng công suất thiết kế hàng trăm W lúc giữa trưa.',
        sourceRef: 'NASA InSight Launch Press Kit (Solar Arrays)',
        limitationNote:
          'Gồm 68 node nan quạt và thanh chống ở trạng thái đã bung hoàn toàn; không giả lập độ phủ bụi thực tế theo ngày Sol.',
        isControlVerified: false,
      },
      {
        id: 'lander_deck',
        label: 'Boong tàu & Ăng-ten chính',
        nodeNames: ['InSight_Deployed'],
        documentedSpec:
          'Thân đổ bộ 3 chân dựa trên kiến trúc Phoenix mang bộ đo địa chấn SEIS, cảm biến khí tượng TWINS và hệ RISE.',
        sourceRef: 'NASA InSight Spacecraft Design · Lockheed Martin',
        limitationNote:
          'Toàn bộ boong, khung 3 chân và ăng-ten được gộp thành 1 node tĩnh InSight_Deployed trong GLB.',
        isControlVerified: false,
      },
    ],
    sources: [
      {
        title: 'NASA Science · InSight Mars Lander',
        url: 'https://science.nasa.gov/mission/insight/',
        checked: '2026-11-14',
        version: 'Supplied NASA 3D Resource GLB (83 nodes)',
      },
    ],
  },
  perseverance_rover: {
    deviceId: 'perseverance_rover',
    modelVersion: '1.0.0 (NASA/JPL-Caltech 25042_Perseverance.glb · fit-longest-side-2 · 66 nodes)',
    generalDisclaimer:
      'Camera presets and subsystem highlights reflect the verified 66-node official NASA/JPL-Caltech Perseverance GLB hierarchy normalized to 2 scene units. Robotic arm joints, mast pan/tilt, and Control Room scans are static/illustrative.',
    cameraViews: [
      {
        id: 'overview',
        label: '3/4 Rover Overview',
        position: [2.15, 1.15, 2.25],
        target: [0, 0.05, 0],
        summary:
          'Overview of all 66 NASA Perseverance mesh nodes: rocker-bogie chassis, extended 2.1 m sampling arm, Remote Sensing Mast, and aft MMRTG power unit.',
        sourceRef: 'NASA Mars 2020 Launch Press Kit & NASA 3D Resource GLB',
        isIllustrativeView: true,
      },
      {
        id: 'mastcam_supercam',
        label: 'Mastcam-Z & SuperCam Head',
        position: [-1.05, 0.92, 1.15],
        target: [-0.26, 0.52, 0.36],
        summary:
          'Close inspection of the Remote Sensing Mast head carrying dual Mastcam-Z zoom cameras, SuperCam laser optics, NavCams, MEDA wind boom, and microphone.',
        sourceRef: 'NASA Mars 2020 Rover Components & Perseverance GLB',
        isIllustrativeView: true,
      },
      {
        id: 'arm_pixl_turret',
        label: '2.1 m Arm & PIXL/WATSON Turret',
        position: [0.85, 0.35, 1.65],
        target: [0.08, -0.02, 0.68],
        summary:
          'Front close-up of the rotary-percussive coring drill, PIXL X-ray spectrometer, WATSON macro camera, and 5-DOF articulated arm harness.',
        sourceRef: 'NASA Mars 2020 Sampling & Caching System Overview',
        isIllustrativeView: true,
      },
      {
        id: 'aft_rtg_rimfax',
        label: 'Aft MMRTG & RIMFAX Radar',
        position: [-1.45, 0.62, -1.55],
        target: [0, 0.02, -0.62],
        summary:
          'Rear view highlighting the Multi-Mission Radioisotope Thermoelectric Generator (MMRTG), RIMFAX ground-penetrating radar antenna, UHF/X-band dishes, and Send Your Name plaque.',
        sourceRef: 'NASA Mars 2020 Power & Communications Fact Sheet',
        isIllustrativeView: true,
      },
    ],
    partGroups: [
      {
        id: 'all',
        label: 'Complete Rover Assembly (66 nodes)',
        nodeNames: [...PERSEVERANCE_ALL_NODES],
        documentedSpec:
          'Launch mass 1,025 kg (dimensions ~3.0 m × 2.7 m × 2.2 m); car-sized Mars 2020 astrobiology and core-caching flagship rover.',
        sourceRef: 'NASA Mars 2020 Launch Press Kit',
        limitationNote:
          'Displays all 66 named nodes of official NASA 25042_Perseverance.glb in extended sampling configuration, normalized via fit-longest-side-2.',
        isControlVerified: true,
      },
      {
        id: 'optics_mast',
        label: 'Remote Sensing Mast & Cameras (17)',
        nodeNames: [...PERSEVERANCE_MAST_OPTICS_NODES],
        documentedSpec:
          'Includes Mastcam-Z stereo zoom imagers, SuperCam LIBS/Raman head (lens), NavCams, EDL Up/Down Look cameras, MEDA probes, and calibration targets.',
        sourceRef: 'NASA Mars 2020 Science Instruments',
        limitationNote:
          'Isolates optical mast and camera assemblies statically; mast pan/tilt actuators are not animated in close-up inspection mode.',
        isControlVerified: false,
      },
      {
        id: 'robotic_arm',
        label: 'Sampling Arm, Turret & Belly Bay (25)',
        nodeNames: [...PERSEVERANCE_ARM_TURRET_NODES],
        documentedSpec:
          '2.1 m 5-axis robotic arm carrying a ~45 kg turret with rotary-percussive coring drill, PIXL, and WATSON, plus under-chassis sample/helicopter bay hardware.',
        sourceRef: 'NASA Mars 2020 Turret & Sample Caching System',
        limitationNote:
          'Turret and arm nodes remain at nominal deployed pose in close-up mode; illustrative arm reach/scan previews live under Option 2 Control Room POV.',
        isControlVerified: false,
      },
      {
        id: 'mobility_chassis',
        label: 'Rocker-Bogie Chassis & Hazcams (17)',
        nodeNames: [...PERSEVERANCE_CHASSIS_MOBILITY_NODES],
        documentedSpec:
          'Titanium rocker-bogie suspension with six 52.5 cm strengthened aluminum curved-grouser wheels, avionics body, MOXIE/ACA bay, and front/rear Hazcams.',
        sourceRef: 'NASA Mars 2020 Mobility & Chassis Architecture',
        limitationNote:
          'Wheels and suspension links are rigid mesh nodes; terrain-following suspension compliance and wheel odometry are not simulated.',
        isControlVerified: false,
      },
      {
        id: 'power_thermal',
        label: 'MMRTG, Antennas & RIMFAX (7)',
        nodeNames: [...PERSEVERANCE_POWER_COMMS_NODES],
        documentedSpec:
          'Pu-238 MMRTG (~110 W initial electric), High-Gain/Low-Gain/UHF antennas, rear bumper RIMFAX subsurface radar, and belly shield panel.',
        sourceRef: 'NASA Mars 2020 Power & Telecommunications',
        limitationNote:
          'Static hardware highlight only; no real-time thermal wattage or radar sounder telemetry is attached to this 3D mesh.',
        isControlVerified: false,
      },
    ],
    sources: [
      {
        title: 'NASA 3D Resources · Mars Perseverance Rover 3D Model',
        url: 'https://science.nasa.gov/resource/mars-perseverance-rover-3d-model/',
        checked: '2026-11-14',
        version: '25042_Perseverance.glb (66 nodes)',
      },
      {
        title: 'NASA Mars 2020 Provenance Notes',
        url: '/assets/provenance/mars-rovers.csv',
        checked: '2026-11-14',
        version: 'Landing coordinates & Mars 2020 press kit cross-check',
      },
    ],
  },
  curiosity_rover: {
    deviceId: 'curiosity_rover',
    modelVersion: '1.0.0 (NASA/JPL-Caltech 24584_Curiosity_static.glb · fit-longest-side-2 · 1 MSL node)',
    generalDisclaimer:
      'Rendered from the official NASA/JPL-Caltech static Curiosity GLB (single unified MSL node). Camera views frame external instruments illustratively; individual subsystems cannot be isolated or articulated.',
    cameraViews: [
      {
        id: 'overview',
        label: '3/4 Rover Overview',
        position: [2.2, 1.18, 2.2],
        target: [0, 0.02, 0],
        summary:
          'Full 3/4 view of Curiosity (Mars Science Laboratory) showing the 6-wheel rocker-bogie suspension, robotic arm, camera mast, and aft MMRTG.',
        sourceRef: 'NASA Mars Science Laboratory Launch Press Kit & 24584_Curiosity_static.glb',
        isIllustrativeView: true,
      },
      {
        id: 'chemcam_mast',
        label: 'ChemCam & Mastcam Head',
        position: [-0.95, 0.95, 1.25],
        target: [-0.15, 0.48, 0.35],
        summary:
          'Close view of the Remote Sensing Mast head carrying ChemCam laser-induced breakdown spectrometer, Mastcam stereo cameras, and Navcams.',
        sourceRef: 'NASA MSL ChemCam & Mastcam Instrument Fact Sheet',
        isIllustrativeView: true,
      },
      {
        id: 'mahli_turret',
        label: 'Sampling Arm & MAHLI Turret',
        position: [0.95, 0.32, 1.68],
        target: [0.05, -0.05, 0.65],
        summary:
          'Close inspection of the 2.1 m forward robotic arm holding APXS, MAHLI hand lens imager, CHIMRA scoop/sieve, and rotary-percussive drill.',
        sourceRef: 'NASA MSL Sample Acquisition & Turret Guide',
        isIllustrativeView: true,
      },
      {
        id: 'rtg_aft',
        label: 'Aft MMRTG & High-Gain Dish',
        position: [-1.5, 0.65, -1.6],
        target: [0, 0.05, -0.62],
        summary:
          'Rear deck view showcasing the diagonally canted Pu-238 MMRTG radiator fins, high-gain X-band dish antenna, and UHF whip antenna.',
        sourceRef: 'NASA MSL Power & Communications Overview',
        isIllustrativeView: true,
      },
    ],
    partGroups: [
      {
        id: 'all',
        label: 'Complete Static MSL Mesh (1 node)',
        nodeNames: [...CURIOSITY_ALL_NODES],
        documentedSpec:
          'Launch mass 899 kg (dimensions ~3.0 m × 2.7 m × 2.2 m); nuclear-powered Mars Science Laboratory laboratory rover operating in Gale Crater since 2012.',
        sourceRef: 'NASA MSL Fact Sheet & NASA 3D Resources (24584_Curiosity_static.glb)',
        limitationNote:
          'The official NASA static GLB merges all rover structures into a single node (`MSL`), so individual subsystems cannot be isolated in 3D highlight mode.',
        isControlVerified: true,
      },
    ],
    sources: [
      {
        title: 'NASA 3D Resources · Curiosity Rover 3D Model (MSL)',
        url: 'https://science.nasa.gov/resource/curiosity-rover-3d-model/',
        checked: '2026-11-14',
        version: '24584_Curiosity_static.glb (static unified MSL mesh)',
      },
      {
        title: 'NASA MSL Provenance Notes',
        url: '/assets/provenance/mars-rovers.csv',
        checked: '2026-11-14',
        version: 'Gale Crater landing coordinates & MSL instrument cross-check',
      },
    ],
  },
};

export function getDeviceControlSpec(deviceId: string | null): DeviceControlSpec | null {
  if (!deviceId) return null;
  return DEVICE_CONTROL_SPECS[deviceId] ?? null;
}

export function getPartGroupSpec(
  spec: DeviceControlSpec,
  groupId: DevicePartGroupId,
) {
  return spec.partGroups.find((group) => group.id === groupId) ?? spec.partGroups[0];
}
