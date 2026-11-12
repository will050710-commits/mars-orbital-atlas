import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { useCosmosStore } from '../../store/useCosmosStore';

export const CesiumMarsBridge: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [tilesetStatus, setTilesetStatus] = useState<'LOADING' | 'ION_3D_TILES' | 'LOCAL_ELLIPSOID'>('LOADING');

  const viewStage = useCosmosStore((state) => state.viewStage);
  const activeTarget = useCosmosStore((state) => state.activeTarget);
  const returnToOrbit = useCosmosStore((state) => state.returnToOrbit);

  useEffect(() => {
    if (viewStage !== 'SURFACE_CESIUM' || !containerRef.current) return;

    let isDisposed = false;
    setTilesetStatus('LOADING');

    // Thiết lập Ellipsoid chuẩn của Sao Hỏa (Bán kính xích đạo 3396.19 km, bán kính cực 3376.20 km)
    Cesium.Ellipsoid.default = Cesium.Ellipsoid.MARS;

    const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;
    if (ionToken) {
      Cesium.Ion.defaultAccessToken = ionToken;
    }

    const viewer = new Cesium.Viewer(containerRef.current, {
      globe: new Cesium.Globe(Cesium.Ellipsoid.MARS),
      skyAtmosphere: false,
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
    });
    viewerRef.current = viewer;

    // Tô màu nền bề mặt chuẩn đất đỏ Sao Hỏa trên Ellipsoid cơ sở
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#9c411e');
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#05060b');

    // Thêm lưới tọa độ Kinh/Vĩ độ bề mặt và cột mốc vị trí hạ cánh
    if (activeTarget?.coordinates) {
      const { lon, lat, elevationKm } = activeTarget.coordinates;
      viewer.entities.add({
        name: activeTarget.name,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 250),
        point: {
          pixelSize: 14,
          color: Cesium.Color.fromCssColorString('#7cdaa1'),
          outlineColor: Cesium.Color.fromCssColorString('#080b12'),
          outlineWidth: 3,
        },
        label: {
          text: `${activeTarget.name.toUpperCase()}\nĐộ cao MOLA: ${elevationKm > 0 ? `+${elevationKm}` : elevationKm} km`,
          font: '600 13px Inter, sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          outlineColor: Cesium.Color.BLACK,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
        },
        ellipse: {
          semiMajorAxis: 35000,
          semiMinorAxis: 35000,
          material: Cesium.Color.fromCssColorString('#f18b62').withAlpha(0.18),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#f18b62'),
        },
      });
    }

    async function loadMars3DTiles() {
      try {
        if (ionToken) {
          // Nạp bộ dữ liệu Cesium Mars 3D Tiles từ Cesium ion (Asset ID chuẩn 3644333)
          const marsTileset = await Cesium.Cesium3DTileset.fromIonAssetId(3644333, {
            maximumScreenSpaceError: 8,
          });
          if (!isDisposed && viewerRef.current) {
            viewer.scene.primitives.add(marsTileset);
            viewer.scene.globe.show = false;
            setTilesetStatus('ION_3D_TILES');
          }
        } else {
          setTilesetStatus('LOCAL_ELLIPSOID');
        }
      } catch {
        if (!isDisposed) {
          setTilesetStatus('LOCAL_ELLIPSOID');
        }
      }

      if (!isDisposed && viewerRef.current && activeTarget?.coordinates) {
        const { lon, lat, height } = activeTarget.coordinates;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
          orientation: {
            heading: Cesium.Math.toRadians(20.0),
            pitch: Cesium.Math.toRadians(-25.0),
            roll: 0.0,
          },
          duration: 2.5,
        });
      }
    }

    void loadMars3DTiles();

    return () => {
      isDisposed = true;
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
    };
  }, [viewStage, activeTarget]);

  if (viewStage !== 'SURFACE_CESIUM') return null;

  return (
    <div className="cesium-bridge-overlay">
      <div ref={containerRef} className="cesium-viewer-container" />
      <div className="cesium-surface-banner glass-panel">
        <div className="cesium-banner-info">
          <span className="telemetry-tag">CHẾ ĐỘ HẠ CÁNH BỀ MẶT • CESIUM MARS ELLIPSOID</span>
          <strong>{activeTarget?.name}</strong>
          <span className="cesium-stream-badge">
            {tilesetStatus === 'ION_3D_TILES'
              ? 'Cesium Ion 3D Tiles (#3644333) Đang Hoạt Động'
              : 'Ellipsoid Sao Hỏa Chuẩn (3396.19 × 3376.20 km)'}
          </span>
        </div>
        <button type="button" className="hud-action-btn" onClick={returnToOrbit}>
          ↑ Phóng Lên Quỹ Đạo (Return to Orbit)
        </button>
      </div>
    </div>
  );
};
