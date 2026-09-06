import { type ThreeEvent, useFrame } from '@react-three/fiber';
import type { Entity } from 'koota';
import { useActions, useWorld } from 'koota/react';
import { useEffect, useMemo } from 'react';
import { MathUtils } from 'three';
import { itemActions } from '../item/actions';
import { Mining } from '../item/traits';
import { Player } from '../character/player/traits';
import { BlockBatch } from './batch';
import { getBlockMaterial, useBlockTextures } from './materials';

type BlockEvent<T> = ThreeEvent<T> & { block?: Entity };

export function BlockRenderer() {
  const world = useWorld();
  const textures = useBlockTextures();
  const batch = useMemo(() => new BlockBatch(textures), [textures]);
  const { interactWith, stopMining } = useActions(itemActions);

  useEffect(() => batch.subscribe(world), [batch, world]);
  useFrame(() => batch.animate(world));

  const handlePointerDown = (event: BlockEvent<PointerEvent>) => {
    if (event.button !== 0 || !event.block || !event.face) return;

    event.stopPropagation();
    interactWith(event.block, { point: event.point, normal: event.face.normal });
  };

  // All blocks are one object to the pointer, so moving onto another block ends the swing loop
  // the same way leaving a block's own mesh used to.
  const handleMove = (event: BlockEvent<PointerEvent>) => {
    const mined = world.queryFirst(Player)?.targetFor(Mining);
    if (mined !== undefined && mined !== event.block) stopMining();
  };

  return (
    <primitive
      object={batch.group}
      onPointerDown={handlePointerDown}
      onPointerMove={handleMove}
      onPointerLeave={stopMining}
    />
  );
}

const DEG = MathUtils.DEG2RAD;

// Hangs from the third-person character's right arm joint, tilted forward the way Minecraft's
// `thirdperson_righthand` block display is.
export function ThirdPersonBlock() {
  return (
    <group position={[0, -0.7, -0.1]} rotation={[75 * DEG, 45 * DEG, 0]} scale={0.375}>
      <BlockModel />
    </group>
  );
}

// A unit cube on the origin, Minecraft's block model space, so the hand display transforms fit.
export function FirstPersonBlock() {
  return <BlockModel />;
}

// The block that gets placed is dirt, so that is what shows in hand.
function BlockModel() {
  const textures = useBlockTextures();
  const material = getBlockMaterial('dirt', textures);

  return (
    <mesh material={material} castShadow>
      <boxGeometry />
    </mesh>
  );
}
