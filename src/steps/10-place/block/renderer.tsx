import { useTexture } from '@react-three/drei/webgpu';
import type { ThreeEvent } from '@react-three/fiber/webgpu';
import type { Entity } from 'koota';
import { useActions, useQuery } from 'koota/react';
import { Position } from '../transform/traits';
import { captureRef } from '../view/capture-ref';
import { blockActions } from './actions';
import { Block } from './traits';

export function BlockRenderer() {
  const blocks = useQuery(Block, Position);
  return blocks.map((entity) => <BlockView key={entity.id()} entity={entity} />);
}

function BlockView({ entity }: { entity: Entity }) {
  const { placeBlock } = useActions(blockActions);
  const texture = useTexture('/dirt.jpg');

  // Right click places a block against the face under the pointer.
  const handlePlace = (event: ThreeEvent<MouseEvent>) => {
    event.nativeEvent.preventDefault();
    event.stopPropagation();
    if (event.face) placeBlock(entity, { point: event.point, normal: event.face.normal });
  };

  return (
    <mesh castShadow receiveShadow ref={captureRef(entity)} onContextMenu={handlePlace}>
      <boxGeometry />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
