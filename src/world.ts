import { createWorld } from 'koota';
import { subscribeBlockGrid } from './block/systems';
import { Blocks } from './block/traits';
import { Construction } from './terrain/traits';
import { Keys, Pointer, Wheel } from './input/traits';
import { Time } from './time/traits';

export const world = createWorld(Time, Keys, Pointer, Wheel, Blocks, Construction);

subscribeBlockGrid(world);
