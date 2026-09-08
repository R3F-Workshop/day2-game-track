import type { World } from 'koota';
import { Position, Rotation } from '../transform/traits';
import { Ref } from './traits';

// Copy simulation transforms into mounted objects before rendering.
export function syncTransforms(world: World) {
  world.query(Position, Ref).readEach(([position, object]) => {
    object?.position.copy(position);
  });

  world.query(Rotation, Ref).readEach(([rotation, object]) => {
    object?.quaternion.copy(rotation);
  });
}
