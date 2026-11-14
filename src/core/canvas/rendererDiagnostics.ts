import type { WebGLRenderer } from 'three';
let renderer: WebGLRenderer | undefined;
// Development-only observation for browser resource-lifecycle regression tests.
export function registerRenderer(value: WebGLRenderer) { if (import.meta.env.DEV) renderer = value; }
export function rendererMemory() {
  return renderer ? { ...renderer.info.memory } : undefined;
}
