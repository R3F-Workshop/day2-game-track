import type { World } from 'koota';
import { Position } from '../transform/traits';
import { Ref } from './traits';

// Copy simulation transforms into mounted objects before rendering.
export function syncTransforms(world: World) {
  world.query(Position, Ref).readEach(([position, object]) => {
    object?.position.copy(position);
  });
}
