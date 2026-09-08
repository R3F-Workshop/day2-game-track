import { useFrame } from '@react-three/fiber/webgpu';
import { useWorld } from 'koota/react';
import { updateTime } from './time/systems';
import { syncTransforms } from './view/systems';

// The tick. Every system runs here, in one order, before the views read the world.
export function Frameloop() {
  const world = useWorld();

  useFrame(
    () => {
      updateTime(world);

      syncTransforms(world);
    },
    { before: 'update' }
  );

  return null;
}
