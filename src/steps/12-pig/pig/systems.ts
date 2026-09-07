import type { World } from 'koota';
import { Input } from '../character/traits';
import { Time } from '../time/traits';
import { Wander } from './traits';

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// A pig's mind. It writes Input just like the keyboard does for the player.
export function updateWanderInput(world: World) {
  const { delta } = world.get(Time)!;

  world.query(Wander, Input).updateEach(([wander, input]) => {
    const isWalking = wander.heading.lengthSq() > 0;
    wander.timer -= delta;

    // Time to switch: walkers rest, and resters pick a new direction to walk.
    if (wander.timer <= 0) {
      if (isWalking) {
        wander.heading.set(0, 0);
        wander.timer = randomBetween(wander.minRest, wander.maxRest);
      } else {
        const angle = randomBetween(0, Math.PI * 2);
        wander.heading.set(Math.cos(angle), Math.sin(angle)).multiplyScalar(wander.speed);
        wander.timer = randomBetween(wander.minWalk, wander.maxWalk);
      }
    }

    input.x = wander.heading.x;
    input.y = wander.heading.y;
    input.jump = false;
  });
}
