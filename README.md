# Mars–Moon Orbital Atlas

Atlas 3D dùng chung cho Sao Hỏa và Mặt Trăng, xây dựng bằng React, TypeScript,
Vite, React Three Fiber và Cesium.

- **Sao Hỏa:** 5 mô hình GLB được cung cấp (Sojourner, Spirit/Opportunity, Viking,
  InSight, Ingenuity), 4 địa danh có nguồn IAU/USGS và 2 hồ sơ thiết bị chưa có mô hình.
- **Mặt Trăng:** globe minh họa, 3 địa danh có nguồn và 6 hồ sơ thiết bị Apollo.
  Không có GLB Mặt Trăng nào được cung cấp; các hồ sơ này không tải mô hình 3D.

Globe và texture của cả hai thiên thể là minh họa, không phải ảnh hoặc địa hình
đo đạc. Ảnh bề mặt, độ cao/địa hình và lớp nhiệt được hiển thị là chưa có.

## Yêu cầu

- Node.js 20.19+ hoặc 22.12+
- npm

## Khởi chạy

```powershell
npm install
npm run dev
```

Chọn Sao Hỏa hoặc Mặt Trăng bằng nút chuyển thiên thể ở thanh trên. Địa danh và
hồ sơ thiết bị nằm trong danh mục bên trái; thông tin, nguồn và trạng thái mô
hình nằm trong panel bên phải.

## Kiểm tra và build

```powershell
npm test
npm run typecheck
npm run build
npm run validate:assets
npm run test:browser
```

`validate:assets` kiểm tra cấu trúc, byte count và SHA-256 của các GLB Sao Hỏa
đang dùng. `test:browser` chạy Playwright/Chrome với SwiftShader cho cả luồng Sao
Hỏa và Mặt Trăng ở desktop lẫn viewport hẹp.

Cesium được phục vụ từ `/cesium/`; các shader GLSL và tài nguyên WASM được cấu
hình trong Vite. Tài nguyên mô hình, texture, âm thanh và decoder được đặt dưới
`public/assets/` và `public/decoders/`. Các mô hình nguồn chưa xử lý đặt dưới
`raw_assets/`. Nguồn dữ liệu và giới hạn hiển thị được ghi tại `docs/SOURCES.md`.
