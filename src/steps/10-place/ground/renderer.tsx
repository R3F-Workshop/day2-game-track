import { useTexture } from '@react-three/drei/webgpu';
import type { ThreeEvent } from '@react-three/fiber/webgpu';
import type { Entity } from 'koota';
import { useActions, useQueryFirst, useTrait } from 'koota/react';
import { RepeatWrapping } from 'three/webgpu';
import { blockActions } from '../block/actions';
import { Position } from '../transform/traits';
import { Ground } from './traits';

export function GroundRenderer() {
  const ground = useQueryFirst(Ground, Position);
  return ground ? <GroundView key={ground.id()} entity={ground} /> : null;
}

function GroundView({ entity }: { entity: Entity }) {
  const { placeBlock } = useActions(blockActions);
  const texture = useTexture('/grass.jpg');
  texture.wrapS = texture.wrapT = RepeatWrapping;
  const position = useTrait(entity, Position);

  // Right click places a block on the ground under the pointer.
  const handlePlace = (event: ThreeEvent<MouseEvent>) => {
    event.nativeEvent.preventDefault();
    event.stopPropagation();
    if (event.face) placeBlock(entity, { point: event.point, normal: event.face.normal });
  };

  return (
    <mesh
      receiveShadow
      position={position?.toArray()}
      rotation-x={-Math.PI / 2}
      onContextMenu={handlePlace}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} map-repeat={[240, 240]} color="green" />
    </mesh>
  );
}
