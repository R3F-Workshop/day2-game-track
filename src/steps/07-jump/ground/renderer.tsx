import { useTexture } from '@react-three/drei/webgpu';
import type { Entity } from 'koota';
import { useQueryFirst, useTrait } from 'koota/react';
import { RepeatWrapping } from 'three/webgpu';
import { Position } from '../transform/traits';
import { Ground } from './traits';

export function GroundRenderer() {
  const ground = useQueryFirst(Ground, Position);
  return ground ? <GroundView key={ground.id()} entity={ground} /> : null;
}

function GroundView({ entity }: { entity: Entity }) {
  const texture = useTexture('/grass.jpg');
  texture.wrapS = texture.wrapT = RepeatWrapping;
  const position = useTrait(entity, Position);

  return (
    <mesh receiveShadow position={position?.toArray()} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} map-repeat={[240, 240]} color="green" />
    </mesh>
  );
}
