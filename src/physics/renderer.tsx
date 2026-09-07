import { Entity } from 'koota';
import { useTrait, useTraitEffect } from 'koota/react';
import { useRef } from 'react';
import type { Mesh } from 'three/webgpu';
import { Position } from '../transform/traits';
import { BoxCollider } from './traits';

export function BoxColliderDebug({ entity }: { entity: Entity }) {
  const box = useTrait(entity, BoxCollider);
  const mesh = useRef<Mesh>(null);
  useTraitEffect(entity, Position, (position) => {
    if (position) mesh.current?.position.copy(position);
  });

  if (!box || !new URLSearchParams(window.location.search).has('debug')) return null;

  return (
    <mesh ref={mesh} renderOrder={1}>
      <boxGeometry args={box.size.toArray()} />
      <meshBasicMaterial color="red" depthTest={false} transparent wireframe />
    </mesh>
  );
}
