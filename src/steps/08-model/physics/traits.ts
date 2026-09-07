import { trait } from 'koota';
import { Vector3 } from 'three';

export const Velocity = trait(() => new Vector3());

// A box around the entity's Position that stays lined up with the world axes.
export const BoxCollider = trait({ size: () => new Vector3(1, 1, 1) });
// A flat floor through the entity's Position, facing up.
export const PlaneCollider = trait();
// Standing on something this tick.
export const IsGrounded = trait();
