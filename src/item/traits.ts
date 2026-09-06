import { relation, trait } from 'koota';

export type ItemKind = 'block' | 'hammer';
export const Item = trait({ kind: 'hammer' as ItemKind });
// Item to owner, for everything an entity carries whether or not it is in hand.
export const CarriedBy = relation({ exclusive: true });
// Item to holder, so views can query the item held by a given entity.
export const HeldBy = relation({ exclusive: true });

// Six Minecraft ticks.
export const ToolSwing = trait({ elapsed: 0, duration: 0.3 });
// The block the player is holding the mouse button on.
export const Mining = relation({ exclusive: true });
// How far the holder can reach with an item, measured from eye level.
export const BlockInteraction = trait({ range: 4.5, eyeHeight: 0.75 });
