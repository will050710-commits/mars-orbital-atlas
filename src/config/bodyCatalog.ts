import { Vector3 } from 'three';
import type { BodyConfig, BodyId, ScientificTelemetry } from '../types/cosmos.types';

export const UNKNOWN_TELEMETRY: ScientificTelemetry = {
  classification: 'Chưa có dữ liệu', meanTemperatureC: 'Chưa có dữ liệu',
  atmosphericPressurePa: 'Chưa có dữ liệu', surfaceGravityMs2: 'Chưa có dữ liệu',
  orbitalVelocityKms: 'Chưa có dữ liệu', geologicalAge: 'Chưa có dữ liệu',
  missionSummary: '', keyHighlights: [],
};

const marsSource = {
  title: 'NASA NSSDCA Mars Fact Sheet',
  url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html',
  checked: '2026-11-14', version: '2025-05-19',
};

const moonSource = {
  title: 'NASA NSSDCA Moon Fact Sheet',
  url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html',
  checked: '2026-11-14', version: 'Last updated 2024-01-11',
};

export const BODY_CATALOG: Record<BodyId, BodyConfig> = {
  mars: {
    id: 'mars', name: 'Sao Hỏa · Mars', radiusKm: 3389.5,
    rotationSeconds: 24.6229 * 3600, color: '#bc623d', textureStyle: 'illustrative-mars',
    source: marsSource,
    target: {
      id: 'mars', bodyId: 'mars', name: 'Sao Hỏa · Mars', subtitle: 'Globe minh họa',
      category: 'PLANET', position: new Vector3(), radius: 3389.5, safeViewDistance: 10500,
      source: marsSource,
      telemetry: { ...UNKNOWN_TELEMETRY, classification: 'Hành tinh đất đá',
        surfaceGravityMs2: '3,73 m/s² (trung bình)',
        missionSummary: 'Bán kính trung bình 3.389,5 km. Globe dùng màu và texture minh họa; chưa có ảnh hoặc địa hình đo đạc.',
        keyHighlights: ['Một đơn vị cảnh = 1 km.', 'Danh mục giới hạn theo tài liệu được cung cấp.'],
      },
    },
    layers: [
      { id: 'globe', label: 'Globe minh họa', status: 'illustrative', detail: 'Texture tạo bằng thuật toán; không phải ảnh NASA hoặc bản đồ địa hình.' },
      { id: 'imagery', label: 'Ảnh bề mặt', status: 'unavailable', detail: 'Chưa có bộ ảnh được xác minh và tích hợp.' },
      { id: 'terrain', label: 'Địa hình / độ cao', status: 'unavailable', detail: 'Chưa có dữ liệu độ cao. Không thể hạ cánh vào địa hình đo đạc.' },
      { id: 'thermal', label: 'Ảnh nhiệt', status: 'unavailable', detail: 'Chưa có bộ dữ liệu nhiệt được xác minh.' },
    ],
  },
  moon: {
    id: 'moon', name: 'Mặt Trăng · Moon', radiusKm: 1737.4,
    rotationSeconds: 2360592, // 655.720 sidereal hours
    color: '#9b9a94', textureStyle: 'illustrative-moon',
    source: moonSource,
    target: {
      id: 'moon', bodyId: 'moon', name: 'Mặt Trăng · Moon', subtitle: 'Globe minh họa',
      category: 'MOON', position: new Vector3(), radius: 1737.4, safeViewDistance: 5400,
      source: moonSource,
      telemetry: { ...UNKNOWN_TELEMETRY, classification: 'Vệ tinh tự nhiên của Trái Đất',
        meanTemperatureC: '95–390 K ở xích đạo (ngày/đêm); không có giá trị trung bình đơn lẻ',
        atmosphericPressurePa: '≈3×10⁻¹⁰ Pa (đêm; 3×10⁻¹⁵ bar)',
        surfaceGravityMs2: '1,62 m/s² (trung bình)',
        orbitalVelocityKms: '1,022 km/s (quỹ đạo quanh Trái Đất)',
        missionSummary: 'Bán kính trung bình 1.737,4 km; chu kỳ tự quay 655,72 giờ. Globe dùng màu và texture minh họa; chưa có ảnh hoặc địa hình đo đạc.',
        keyHighlights: ['Một đơn vị cảnh = 1 km.', 'Không có GLB Mặt Trăng nào được cung cấp; thiết bị Apollo chỉ là hồ sơ.', 'Chưa có ảnh, độ cao hoặc lớp nhiệt được xác minh.'],
      },
    },
    layers: [
      { id: 'globe', label: 'Globe minh họa', status: 'illustrative', detail: 'Texture xám tạo bằng thuật toán; không phải ảnh NASA hoặc bản đồ địa hình Mặt Trăng.' },
      { id: 'imagery', label: 'Ảnh bề mặt', status: 'unavailable', detail: 'Chưa có bộ ảnh Mặt Trăng được xác minh và tích hợp.' },
      { id: 'terrain', label: 'Địa hình / độ cao', status: 'unavailable', detail: 'Chưa có dữ liệu độ cao; không thể hạ cánh vào địa hình đo đạc.' },
      { id: 'thermal', label: 'Ảnh nhiệt', status: 'unavailable', detail: 'Chưa có bộ dữ liệu nhiệt Mặt Trăng được xác minh.' },
    ],
  },
};
