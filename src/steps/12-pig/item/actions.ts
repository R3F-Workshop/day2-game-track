import { createActions, type Entity } from 'koota';
import { BlockDamage } from '../block/traits';
import { Player } from '../player/traits';
import { ToolSwing } from './traits';

export const itemActions = createActions((world) => ({
  // Swings the player's tool at a block. Each hit adds damage, and the last one breaks it.
  hitBlock: (block: Entity) => {
    const player = world.queryFirst(Player);
    const damage = block.get(BlockDamage);
    if (!player || !damage) return;

    // Removing and adding again restarts the swing and tells onAdd subscribers.
    player.remove(ToolSwing);
    player.add(ToolSwing);

    const hits = damage.hits + 1;
    if (hits >= damage.hitsToBreak) block.destroy();
    else block.set(BlockDamage, { ...damage, hits });
  },
}));
