import { createWorld } from 'koota';
import { actions } from './actions';
import { Follows } from './camera/traits';
import { Keys, Pointer, Wheel } from './input/traits';
import { Time } from './time/traits';

export const world = createWorld(Time, Keys, Pointer, Wheel);

const { spawnPlayer, spawnCamera } = actions(world);
const player = spawnPlayer({ position: [0, 1, 0] });
const camera = spawnCamera();
camera.add(Follows(player));

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
