import { Color, Quaternion, Vector3 } from 'three';
import type { Material, Mesh, Object3D } from 'three';
import { getPartGroupSpec } from '../../config/deviceControlSpecs';
import type {
  DeviceControlSpec,
  DevicePartGroupId,
  DeviceRotorControlSpec,
} from '../../types/cosmos.types';

interface MaterialBaseState {
  transparent: boolean;
  opacity: number;
  depthWrite: boolean;
  emissiveHex: number | null;
  emissiveIntensity: number | null;
}

type EmissiveMaterial = Material & {
  emissive: Color;
  emissiveIntensity?: number;
};

const HIGHLIGHT_EMISSIVE = new Color(0x38bdf8);
const FADED_OPACITY = 0.16;

function isMesh(object: Object3D): object is Mesh {
  return 'isMesh' in object && (object as Mesh).isMesh === true;
}

function hasEmissiveColor(material: Material): material is EmissiveMaterial {
  return 'emissive' in material && (material as Partial<EmissiveMaterial>).emissive instanceof Color;
}

function captureMaterialBaseState(material: Material): MaterialBaseState {
  const existing = material.userData.__deviceBaseState as MaterialBaseState | undefined;
  if (existing) return existing;

  const hasEmissive = hasEmissiveColor(material);
  const state: MaterialBaseState = {
    transparent: material.transparent,
    opacity: material.opacity,
    depthWrite: material.depthWrite,
    emissiveHex: hasEmissive ? material.emissive.getHex() : null,
    emissiveIntensity:
      hasEmissive && typeof material.emissiveIntensity === 'number'
        ? material.emissiveIntensity
        : null,
  };
  material.userData.__deviceBaseState = state;
  return state;
}

function resolveMeshMaterials(mesh: Mesh): Material[] {
  if (Array.isArray(mesh.material)) return mesh.material;
  return mesh.material ? [mesh.material] : [];
}

function resolveOwningNodeName(
  mesh: Object3D,
  root: Object3D,
  knownNodeNames: Set<string>,
): string {
  let cursor: Object3D | null = mesh;
  let fallbackName = '';
  while (cursor && cursor !== root.parent) {
    if (cursor.name) {
      if (knownNodeNames.has(cursor.name)) return cursor.name;
      if (!fallbackName) fallbackName = cursor.name;
    }
    if (cursor === root) break;
    cursor = cursor.parent;
  }
  return fallbackName;
}

/**
 * Index named objects under a loaded GLTF/Three.js scene root.
 */
export function getDeviceNodeMap(root: Object3D): Record<string, Object3D> {
  const map: Record<string, Object3D> = {};
  root.traverse((object) => {
    if (object.name && !map[object.name]) {
      map[object.name] = object;
    }
  });
  return map;
}

/**
 * Prepare a normalized GLTF device subtree for safe non-destructive inspection:
 * - caches each node's initial quaternion before any rotor stepping/spin;
 * - clones per-mesh materials so highlighting one part group never leaks onto
 *   unrelated nodes sharing the same source GLTF material;
 * - disposes replaced original shared materials so GPU memory tracking stays clean.
 */
export function prepareControlledDeviceScene(root: Object3D): Record<string, Object3D> {
  if (root.userData.__deviceControlPrepared) {
    return getDeviceNodeMap(root);
  }

  const originalMaterials = new Set<Material>();
  root.traverse((object) => {
    if (!object.userData.__baseQuaternion) {
      object.userData.__baseQuaternion = object.quaternion.clone();
    }
    if (!isMesh(object)) return;

    const currentMaterials = resolveMeshMaterials(object);
    if (currentMaterials.length === 0) return;

    currentMaterials.forEach((mat) => originalMaterials.add(mat));
    if (Array.isArray(object.material)) {
      object.material = object.material.map((mat) => {
        const cloned = mat.clone();
        captureMaterialBaseState(cloned);
        return cloned;
      });
    } else if (object.material) {
      const cloned = object.material.clone();
      captureMaterialBaseState(cloned);
      object.material = cloned;
    }
  });

  originalMaterials.forEach((mat) => mat.dispose());
  root.userData.__deviceControlPrepared = true;
  return getDeviceNodeMap(root);
}

/**
 * Highlight one documented subsystem node group and dim non-selected parts,
 * or restore unaltered GLB appearance when `'all'` is active.
 */
export function applyDevicePartHighlight(
  root: Object3D,
  spec: DeviceControlSpec,
  groupId: DevicePartGroupId,
): void {
  const group = getPartGroupSpec(spec, groupId);
  const showAll = group.id === 'all';
  const activeNodes = new Set(group.nodeNames);
  const allSpecNodes = new Set(spec.partGroups.flatMap((entry) => entry.nodeNames));

  root.traverse((object) => {
    if (!isMesh(object)) return;
    const ownerName = resolveOwningNodeName(object, root, allSpecNodes);
    const isSelected = showAll || activeNodes.has(ownerName);

    for (const mat of resolveMeshMaterials(object)) {
      const base = captureMaterialBaseState(mat);
      const prevTransparent = mat.transparent;

      if (showAll) {
        mat.transparent = base.transparent;
        mat.opacity = base.opacity;
        mat.depthWrite = base.depthWrite;
        if (hasEmissiveColor(mat) && base.emissiveHex !== null) {
          mat.emissive.setHex(base.emissiveHex);
          if (base.emissiveIntensity !== null) {
            mat.emissiveIntensity = base.emissiveIntensity;
          }
        }
      } else if (isSelected) {
        mat.transparent = base.transparent;
        mat.opacity = base.opacity;
        mat.depthWrite = base.depthWrite;
        if (hasEmissiveColor(mat) && base.emissiveHex !== null) {
          mat.emissive.setHex(base.emissiveHex).lerp(HIGHLIGHT_EMISSIVE, 0.38);
          mat.emissiveIntensity = Math.max(base.emissiveIntensity ?? 0, 0.35);
        }
      } else {
        mat.transparent = true;
        mat.opacity = Math.min(base.opacity, FADED_OPACITY);
        mat.depthWrite = false;
        if (hasEmissiveColor(mat) && base.emissiveHex !== null) {
          mat.emissive.setHex(base.emissiveHex);
          if (base.emissiveIntensity !== null) {
            mat.emissiveIntensity = base.emissiveIntensity;
          }
        }
      }

      if (prevTransparent !== mat.transparent) {
        mat.needsUpdate = true;
      }
    }
  });
}

/**
 * Rotate upper and lower coaxial rotor nodes around their GLB local axis
 * relative to their initial rest orientation. In Ingenuity's GLB, `rotors_01`
 * and `rotors_02` have opposite-sign world +Y/-Y orientations along local [1, 0, 0],
 * producing physically counter-rotating motion from one shared positive angle.
 */
export function applyCoaxialRotorRotation(
  nodeMap: Record<string, Object3D>,
  rotorControl: DeviceRotorControlSpec,
  angleRad: number,
): void {
  const axis = new Vector3(...rotorControl.localAxis);
  if (axis.lengthSq() === 0) return;
  axis.normalize();

  const delta = new Quaternion().setFromAxisAngle(axis, angleRad);
  const targets = [rotorControl.upperNodeName, rotorControl.lowerNodeName];
  for (const name of targets) {
    const node = nodeMap[name];
    if (!node) continue;
    const base =
      (node.userData.__baseQuaternion as Quaternion | undefined) ??
      (node.userData.__baseQuaternion = node.quaternion.clone());
    node.quaternion.copy(base).multiply(delta);
  }
}

/**
 * Transform a node's local unit direction into world space to verify spin-axis alignment.
 */
export function getWorldAxisForLocalDirection(
  node: Object3D,
  localAxis: [number, number, number],
): Vector3 {
  node.updateWorldMatrix(true, false);
  const worldQuat = new Quaternion();
  node.getWorldQuaternion(worldQuat);
  return new Vector3(...localAxis).normalize().applyQuaternion(worldQuat).normalize();
}
