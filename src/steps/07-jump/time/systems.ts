import type { World } from 'koota';
import { Time } from './traits';

export function updateTime(world: World) {
  const time = world.get(Time)!;

  // The first tick has nothing to measure against.
  if (time.current === 0) time.current = performance.now();

  const now = performance.now();
  const delta = now - time.current;

  // Cap the step so a stalled tab does not launch everything on the next frame.
  time.delta = Math.min(delta / 1000, 1 / 30);
  time.current = now;

  world.set(Time, time);
}
