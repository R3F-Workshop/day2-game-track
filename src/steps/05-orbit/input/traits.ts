import { trait } from 'koota';
import { Vector2 } from 'three';

export const Pointer = trait({
  // Normalized device coordinates, -1 to 1 across the window.
  position: () => new Vector2(),
  // Movement accumulated since the last tick.
  delta: () => new Vector2(),
  // Held buttons bitmask, like MouseEvent.buttons.
  buttons: 0,
});
// Notches scrolled since the last tick, positive when scrolling down.
export const Wheel = trait({ delta: 0 });
