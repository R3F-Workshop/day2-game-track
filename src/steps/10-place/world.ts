import { createWorld } from 'koota';
import { Vector3 } from 'three';
import { actions } from './actions';
import { Follows } from './camera/traits';
import { Keys, Pointer, Wheel } from './input/traits';
import { Time } from './time/traits';

export const world = createWorld(Time, Keys, Pointer, Wheel);

const { spawnPlayer, spawnCamera, spawnGround, spawnBlockAt } = actions(world);
spawnGround();
// One block to build from.
spawnBlockAt(new Vector3(0, 0.5, -3));
// Drop in from above to see gravity at work.
const player = spawnPlayer({ position: [0, 4, 0] });
const camera = spawnCamera();
camera.add(Follows(player));

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
