import { trait } from 'koota';

export const Block = trait();
// Hits taken so far, and how many break the block.
export const BlockDamage = trait({ hits: 0, hitsToBreak: 3 });
