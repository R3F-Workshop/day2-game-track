import type { World } from 'koota';
import { MathUtils, Matrix4, Vector3 } from 'three';
import { Pointer, Wheel } from '../input/traits';
import { Position, Rotation } from '../transform/traits';
import { Follows, OrbitController } from './traits';

const UP = new Vector3(0, 1, 0);
const matrix = new Matrix4();

// Keeps the orbit centered on whatever the camera follows.
export function updateFollowTarget(world: World) {
  world.query(Follows('*'), OrbitController).updateEach(([controller], entity) => {
    const targetPosition = entity.targetFor(Follows)?.get(Position);

    if (targetPosition) controller.target.copy(targetPosition);
  });
}

// Moves the orbit by this tick's input.
export function updateOrbitController(world: World) {
  const pointer = world.get(Pointer)!;
  const wheel = world.get(Wheel)!;

  world.query(OrbitController).updateEach(([controller]) => {
    const { spherical, minDistance, maxDistance } = controller;

    // Dragging across the whole window turns the camera all the way around.
    if (pointer.buttons !== 0) {
      spherical.theta -= pointer.delta.x * Math.PI;
      spherical.phi += pointer.delta.y * Math.PI;
    }

    // Each notch zooms by a tenth, so it feels the same near and far.
    spherical.radius *= 1.1 ** wheel.delta;

    spherical.radius = MathUtils.clamp(spherical.radius, minDistance, maxDistance);
    // Stay above the ground and off the pole straight overhead.
    spherical.phi = MathUtils.clamp(spherical.phi, 0.1, Math.PI / 2);
  });
}

// Places the camera on its orbit, facing the target.
export function applyOrbit(world: World) {
  world.query(OrbitController, Position, Rotation).updateEach(([controller, position, rotation]) => {
    const { spherical, target } = controller;

    position.setFromSpherical(spherical).add(target);
    matrix.lookAt(position, target, UP);
    rotation.setFromRotationMatrix(matrix);
  });
}
