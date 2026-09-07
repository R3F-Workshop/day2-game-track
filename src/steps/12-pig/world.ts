import { createWorld } from 'koota';
import { Vector3 } from 'three';
import { actions } from './actions';
import { Follows } from './camera/traits';
import { Keys, Pointer, Wheel } from './input/traits';
import { Time } from './time/traits';
import { Position } from './transform/traits';

export const world = createWorld(Time, Keys, Pointer, Wheel);

const { spawnPlayer, spawnCamera, spawnGround, spawnBlockAt, spawnPigNear } = actions(world);
spawnGround();
// One block to build from.
spawnBlockAt(new Vector3(0, 0.5, -3));
// Drop in from above to see gravity at work.
const player = spawnPlayer({ position: [0, 4, 0] });
const camera = spawnCamera();
camera.add(Follows(player));
// Some company. Press R for more.
spawnPigNear(player.get(Position)!);
spawnPigNear(player.get(Position)!);

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
