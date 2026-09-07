import { Not, type World } from 'koota';
import type { Vector3 } from 'three';
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

// Pushes the body out of the box along the axis it overlaps least, the shortest way out. Returns
// whether the body ended up standing on the box.
function resolveOverlap(
  position: Vector3,
  velocity: Vector3,
  size: Vector3,
  otherPosition: Vector3,
  otherSize: Vector3
) {
  const deltaX = position.x - otherPosition.x;
  const deltaY = position.y - otherPosition.y;
  const deltaZ = position.z - otherPosition.z;
  const overlapX = (size.x + otherSize.x) / 2 - Math.abs(deltaX);
  const overlapY = (size.y + otherSize.y) / 2 - Math.abs(deltaY);
  const overlapZ = (size.z + otherSize.z) / 2 - Math.abs(deltaZ);

  if (overlapX < 0 || overlapY < 0 || overlapZ < 0) return false;

  if (overlapY <= overlapX && overlapY <= overlapZ) {
    const direction = deltaY < 0 ? -1 : 1;
    position.y += overlapY * direction;
    if (velocity.y * direction < 0) velocity.y = 0;
    return direction > 0;
  }

  if (overlapX <= overlapZ) {
    const direction = deltaX < 0 ? -1 : 1;
    position.x += overlapX * direction;
    if (velocity.x * direction < 0) velocity.x = 0;
  } else {
    const direction = deltaZ < 0 ? -1 : 1;
    position.z += overlapZ * direction;
    if (velocity.z * direction < 0) velocity.z = 0;
  }

  return false;
}

// Keeps moving boxes out of the boxes that stay put, like blocks.
export function resolveBoxCollisions(world: World) {
  const obstacles = world.query(Position, BoxCollider, Not(Velocity));

  world.query(Position, Velocity, BoxCollider).updateEach(([position, velocity, box], entity) => {
    let isGrounded = entity.has(IsGrounded);

    obstacles.forEach((obstacle) => {
      const landed = resolveOverlap(
        position,
        velocity,
        box.size,
        obstacle.get(Position)!,
        obstacle.get(BoxCollider)!.size
      );
      if (landed) isGrounded = true;
    });

    if (isGrounded) entity.add(IsGrounded);
  });
}
