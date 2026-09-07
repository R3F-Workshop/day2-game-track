import { Entity } from 'koota';
import { useTrait, useTraitEffect } from 'koota/react';
import { useState } from 'react';
import { type Vector3Tuple } from 'three/webgpu';
import { Position } from '../transform/traits';
import { BoxCollider } from './traits';

export function BoxColliderDebug({ entity }: { entity: Entity }) {
  const box = useTrait(entity, BoxCollider);
  const [position, setPosition] = useState<Vector3Tuple>();
  useTraitEffect(entity, Position, (value) => setPosition(value?.toArray()));

  if (!box || !position || !new URLSearchParams(window.location.search).has('debug')) return null;

  return (
    <mesh position={position} renderOrder={1}>
      <boxGeometry args={box.size.toArray()} />
      <meshBasicMaterial color="red" depthTest={false} transparent wireframe />
    </mesh>
  );
}
