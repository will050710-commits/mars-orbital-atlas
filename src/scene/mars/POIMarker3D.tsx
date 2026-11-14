import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { useCosmosStore } from '../../store/useCosmosStore';
import type { CelestialTarget } from '../../types/cosmos.types';

export function POIMarker3D({ target, planetCenter }: { target: CelestialTarget; planetCenter: Vector3; variant?: 1 | 2 | 3 | 4 }) {
  const ref = useRef<Group>(null);
  const world = useRef(new Vector3());
  const normal = useRef(new Vector3());
  const toCamera = useRef(new Vector3());
  const selected = useCosmosStore((state) => state.activeTarget?.id === target.id);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.getWorldPosition(world.current);
    useCosmosStore.getState().updateDynamicPosition(target.id, world.current);
    normal.current.copy(world.current).sub(planetCenter).normalize();
    toCamera.current.copy(camera.position).sub(world.current).normalize();
    ref.current.visible = normal.current.dot(toCamera.current) > 0;
  });
  // The matching DOM catalog buttons provide keyboard access and full labels.
  return <group ref={ref} position={target.position}>
    <mesh onClick={(event) => { event.stopPropagation(); useCosmosStore.getState().selectTarget(target); }}>
      <sphereGeometry args={[22, 12, 12]} />
      <meshBasicMaterial color={selected ? '#9affbd' : '#ffdc8f'} />
    </mesh>
  </group>;
}
