import { createWorld } from 'koota';
import { actions } from './actions';
import { Pointer, Wheel } from './input/traits';
import { Time } from './time/traits';

export const world = createWorld(Time, Pointer, Wheel);

const { spawnPlayer, spawnCamera } = actions(world);
spawnPlayer({ position: [0, 1, 0] });
spawnCamera({ target: [0, 1, 0] });

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
