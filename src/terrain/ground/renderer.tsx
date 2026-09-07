import { useTexture } from '@react-three/drei/webgpu';
import type { ThreeEvent } from '@react-three/fiber/webgpu';
import { Entity } from 'koota';
import { useActions, useQueryFirst, useTrait } from 'koota/react';
import { RepeatWrapping } from 'three/webgpu';
import grassImg from '../../assets/grass.jpg';
import { itemActions } from '../../item/actions';
import { Position } from '../../transform/traits';
import { Ground } from './traits';

export function GroundRenderer() {
  const ground = useQueryFirst(Ground, Position);
  return ground ? <GroundView key={ground.id()} entity={ground} /> : null;
}

function GroundView({ entity }: { entity: Entity }) {
  const { interactWith } = useActions(itemActions);
  const texture = useTexture(grassImg);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  const position = useTrait(entity, Position);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0 || !event.face) return;

    event.stopPropagation();
    interactWith(entity, { point: event.point, normal: event.face.normal });
  };

  return (
    <mesh
      receiveShadow
      position={position?.toArray()}
      rotation-x={-Math.PI / 2}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} map-repeat={[240, 240]} color="green" />
    </mesh>
  );
}
