import { createActions } from 'koota';
import { Vector3 } from 'three';
import { Position, Rotation } from '../transform/traits';
import { Camera, OrbitController } from './traits';

export const cameraActions = createActions((world) => ({
  spawnCamera: ({ target = [0, 0, 0] } = {}) => {
    // The controller places the camera every tick, so it only needs to know what to orbit.
    return world.spawn(
      Camera,
      Position,
      Rotation,
      OrbitController({ target: new Vector3(...target) })
    );
  },
}));
