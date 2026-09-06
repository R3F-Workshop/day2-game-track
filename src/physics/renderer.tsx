import { Entity } from 'koota';
import { useTrait } from 'koota/react';
import { Position } from '../transform/traits';
import { BoxCollider } from './traits';

export function BoxColliderDebug({ entity }: { entity: Entity }) {
  const box = useTrait(entity, BoxCollider);
  const position = useTrait(entity, Position);

  if (!box || !position || !new URLSearchParams(window.location.search).has('debug')) return null;

  return (
    <mesh position={position.toArray()} renderOrder={1}>
      <boxGeometry args={box.size.toArray()} />
      <meshBasicMaterial color="red" depthTest={false} transparent wireframe />
    </mesh>
  );
}
