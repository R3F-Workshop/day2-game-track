import { trait } from 'koota';
import { Vector3 } from 'three';

export const Velocity = trait(() => new Vector3());

// Box colliders remain aligned with the world when an entity rotates.
export const BoxCollider = trait({ size: () => new Vector3(1, 1, 1) });
export const PlaneCollider = trait({ normal: () => new Vector3(0, 1, 0) });
export const IsGrounded = trait();
export const DynamicBody = trait({ mass: 1 });
