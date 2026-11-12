import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [react(), cesium(), glsl()],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium/'),
  },
  assetsInclude: ['**/*.glsl', '**/*.wasm'],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
