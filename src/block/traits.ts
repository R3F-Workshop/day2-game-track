import { trait } from 'koota';
import { BlockGrid } from './grid';

export const Block = trait();
export const BlockDamage = trait({ hits: 0, hitsToBreak: 3 });

export type BlockKindName = 'grass' | 'dirt' | 'stone' | 'sand' | 'log' | 'leaves' | 'water' | 'snow';
export const BlockKind = trait({ kind: 'dirt' as BlockKindName });
// World trait: every block entity indexed by cell.
export const Blocks = trait(() => new BlockGrid());
