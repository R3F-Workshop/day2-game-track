import { trait } from 'koota';
import { Vector2 } from 'three';

export const Pig = trait();

// A random stroll: rest for a while, then walk in a random direction for a while.
export const Wander = trait({
  // Direction in Input space, or zero while resting.
  heading: () => new Vector2(),
  // Seconds left in the current rest or walk.
  timer: 0,
  minRest: 1,
  maxRest: 4,
  minWalk: 1,
  maxWalk: 3,
  // Fraction of the controller's max speed to amble at.
  speed: 0.25,
});
