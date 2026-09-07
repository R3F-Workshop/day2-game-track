import { useTexture } from '@react-three/drei/webgpu';
import type { ThreeEvent } from '@react-three/fiber/webgpu';
import type { Entity } from 'koota';
import { useActions, useQuery, useTrait } from 'koota/react';
import { itemActions } from '../item/actions';
import { Position } from '../transform/traits';
import { blockActions } from './actions';
import { Block, BlockDamage } from './traits';

export function BlockRenderer() {
  const blocks = useQuery(Block, Position);
  return blocks.map((entity) => <BlockView key={entity.id()} entity={entity} />);
}

function BlockView({ entity }: { entity: Entity }) {
  const { placeBlock } = useActions(blockActions);
  const { hitBlock } = useActions(itemActions);
  const position = useTrait(entity, Position);
  const damage = useTrait(entity, BlockDamage);
  const texture = useTexture('/dirt.jpg');
  // Darkens as the block takes hits.
  const brightness = damage ? 1 - 0.6 * (damage.hits / damage.hitsToBreak) : 1;

  // Left click hits the block with the tool in hand.
  const handleHit = (event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0) return;

    event.stopPropagation();
    hitBlock(entity);
  };

  // Right click places a block against the face under the pointer.
  const handlePlace = (event: ThreeEvent<MouseEvent>) => {
    event.nativeEvent.preventDefault();
    event.stopPropagation();
    if (event.face) placeBlock(entity, { point: event.point, normal: event.face.normal });
  };

  return (
    <mesh
      castShadow
      receiveShadow
      position={position?.toArray()}
      onPointerDown={handleHit}
      onContextMenu={handlePlace}
    >
      <boxGeometry />
      <meshStandardMaterial map={texture} color={[brightness, brightness, brightness]} />
    </mesh>
  );
}
