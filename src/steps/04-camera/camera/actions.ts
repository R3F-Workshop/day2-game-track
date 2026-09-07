import { createActions } from 'koota';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { Position, Rotation } from '../transform/traits';
import { Camera } from './traits';

export const cameraActions = createActions((world) => ({
  spawnCamera: ({ position = [0, 0, 0], target = [0, 0, 0] } = {}) => {
    const eye = new Vector3(...position);
    // A rotation is a quaternion. Build it from the direction the camera should face.
    const lookAt = new Matrix4().lookAt(eye, new Vector3(...target), new Vector3(0, 1, 0));
    const rotation = new Quaternion().setFromRotationMatrix(lookAt);

    return world.spawn(Camera, Position(eye), Rotation(rotation));
  },
}));
