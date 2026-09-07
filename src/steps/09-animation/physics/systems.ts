import type { World } from 'koota';
import { Position } from '../transform/traits';
import { BoxCollider, IsGrounded, PlaneCollider, Velocity } from './traits';

// Lifts every box that sank into a floor back on top of it, and marks it as standing.
export function resolveBoxPlaneCollisions(world: World) {
  const planes = world.query(PlaneCollider, Position);

  world.query(Position, Velocity, BoxCollider).updateEach(([position, velocity, box], entity) => {
    let isGrounded = false;

    planes.readEach(([planePosition]) => {
      const bottom = position.y - box.size.y / 2;
      if (bottom > planePosition.y) return;

      position.y += planePosition.y - bottom;
      // Stop falling, but keep any upward motion like the start of a jump.
      if (velocity.y < 0) velocity.y = 0;
      isGrounded = true;
    });

    if (isGrounded) entity.add(IsGrounded);
    else entity.remove(IsGrounded);
  });
}
