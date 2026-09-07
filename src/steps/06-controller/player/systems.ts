import type { World } from 'koota';
import { Vector3 } from 'three';
import { Camera, Follows } from '../camera/traits';
import { Input } from '../character/traits';
import { Keys } from '../input/traits';
import { Rotation } from '../transform/traits';
import { Player } from './traits';

const UP = new Vector3(0, 1, 0);
const cameraForward = new Vector3();
const cameraRight = new Vector3();

// Reads the held keys into the player's Input, relative to the camera that follows them.
export function updatePlayerInput(world: World) {
  const keys = world.get(Keys)!;

  world.query(Player, Input).updateEach(([input], entity) => {
    const right = keys.has('arrowright') || keys.has('d');
    const left = keys.has('arrowleft') || keys.has('a');
    const up = keys.has('arrowup') || keys.has('w');
    const down = keys.has('arrowdown') || keys.has('s');

    // Normalize so a diagonal is no faster than a straight line.
    const x = Number(right) - Number(left);
    const y = Number(up) - Number(down);
    const length = Math.hypot(x, y) || 1;

    const localX = x / length;
    const localY = y / length;
    const cameraRotation = world.queryFirst(Camera, Follows(entity), Rotation)?.get(Rotation);
    if (!cameraRotation) return;

    // Forward is wherever the camera looks, flattened onto the ground.
    cameraForward.set(0, 0, -1).applyQuaternion(cameraRotation);
    cameraForward.y = 0;
    cameraForward.normalize();
    cameraRight.crossVectors(cameraForward, UP);

    input.x = cameraRight.x * localX + cameraForward.x * localY;
    input.y = -(cameraRight.z * localX + cameraForward.z * localY);
  });
}
