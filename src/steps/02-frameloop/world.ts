import { createWorld } from 'koota';
import { Time } from './time/traits';

export const world = createWorld(Time);

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
