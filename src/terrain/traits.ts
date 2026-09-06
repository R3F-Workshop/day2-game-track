import { type Entity, trait } from 'koota';
import type { BlockKindName } from '../block/traits';

// Blocks from world generation, so a new world only replaces the previous one.
export const Terrain = trait();
// Rises into place after a cue, so a new world can ripple outward from the player.
export const Reveal = trait({ delay: 0, elapsed: 0, duration: 0.4 });

export type PendingBlock = { x: number; y: number; z: number; kind: BlockKindName; delay: number };
export type DoomedBlock = { entity: Entity; delay: number };
// World trait: a world being built. Blocks spawn and old ones go just ahead of their reveal cue,
// so the work spreads over the sweep instead of stalling a frame. Both lists are in cue order.
export const Construction = trait(() => ({
  pending: [] as PendingBlock[],
  doomed: [] as DoomedBlock[],
  nextPending: 0,
  nextDoomed: 0,
  elapsed: 0,
}));
