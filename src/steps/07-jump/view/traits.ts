import { trait } from 'koota';
import type { Object3D } from 'three/webgpu';

// The mounted Three object for an entity. Only the view uses this trait.
export const Ref = trait((): Object3D | null => null);
