import { useFrame } from '@react-three/fiber/webgpu';
import { useWorld } from 'koota/react';
import { applyOrbit, updateOrbitController } from './camera/systems';
import { usePointer, useWheel } from './input/hooks';
import { resetInputDelta } from './input/systems';
import { updateTime } from './time/systems';
import { syncTransforms } from './view/systems';

// The tick. Every system runs here, in one order, before the views read the world.
export function Frameloop() {
  const world = useWorld();
  usePointer(world);
  useWheel(world);

  useFrame(
    () => {
      updateTime(world);

      updateOrbitController(world);
      applyOrbit(world);

      resetInputDelta(world);

      syncTransforms(world);
    },
    { before: 'update' }
  );

  return null;
}
