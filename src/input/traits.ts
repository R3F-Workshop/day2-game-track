import { trait } from 'koota';
import { Vector2 } from 'three';

export const Keys = trait(() => new Set<string>());
export const Pointer = trait({
  // Normalized device coordinates.
  position: () => new Vector2(),
  // Accumulated since the last frame.
  delta: () => new Vector2(),
  // Held buttons bitmask, like MouseEvent.buttons.
  buttons: 0,
});
// Positive when scrolling down.
export const Wheel = trait({ delta: 0 });
