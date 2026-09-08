import type { Entity } from 'koota';
import type { Object3D } from 'three/webgpu';
import { Ref } from './traits';

// Capture the mounted object and release it when React detaches the ref.
export function captureRef(entity: Entity) {
  return (object: Object3D | null) => {
    if (!object || !entity.isAlive()) return;

    if (entity.has(Ref)) entity.set(Ref, object);
    else entity.add(Ref(object));

    return () => {
      if (entity.isAlive() && entity.get(Ref) === object) entity.remove(Ref);
    };
  };
}
