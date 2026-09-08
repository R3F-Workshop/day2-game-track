import { trait } from 'koota';
import { Quaternion, Vector3 } from 'three';

export const Position = trait(() => new Vector3());
export const Rotation = trait(() => new Quaternion());
