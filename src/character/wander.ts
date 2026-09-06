import { trait, type World } from 'koota';
import { random } from 'math/random';
import { Vector2 } from 'three';
import { Input } from '../controllers/characterController';
import { IsGrounded, Velocity } from '../physics/traits';
import { Rides } from '../riding/traits';
import { Time } from '../time/traits';

// Random stroll: rest for a while, then walk in a random direction for a while.
export const Wander = trait({
  // Unit vector in Input space, or zero while resting.
  heading: () => new Vector2(),
  // Seconds left in the current rest or walk.
  timer: 0,
  // Seconds spent pushing against something while walking.
  blocked: 0,
  minRest: 1,
  maxRest: 4,
  minWalk: 1,
  maxWalk: 3,
  // Fraction of the controller's max speed to amble at.
  speed: 0.25,
});

export function updateWanderInput(world: World) {
  const { delta } = world.get(Time)!;

  world.query(Wander, Input, Velocity).updateEach(([wander, input, velocity], entity) => {
    // A rider is steering, so the mount has no mind of its own.
    if (world.queryFirst(Rides(entity))) return;

    const isWalking = wander.heading.lengthSq() > 0;
    wander.timer -= delta;

    // Walking into a block goes nowhere, so give up on that heading early.
    if (isWalking && entity.has(IsGrounded) && Math.hypot(velocity.x, velocity.z) < 0.1) {
      wander.blocked += delta;
    } else {
      wander.blocked = 0;
    }

    if (wander.timer <= 0 || wander.blocked >= 0.3) {
      wander.blocked = 0;

      if (isWalking) {
        wander.heading.set(0, 0);
        wander.timer = random.float(Math.random, wander.minRest, wander.maxRest);
      } else {
        const angle = random.float(Math.random, 0, Math.PI * 2);
        wander.heading.set(Math.cos(angle), Math.sin(angle)).multiplyScalar(wander.speed);
        wander.timer = random.float(Math.random, wander.minWalk, wander.maxWalk);
      }
    }

    input.x = wander.heading.x;
    input.y = wander.heading.y;
    input.jump = false;
  });
}
