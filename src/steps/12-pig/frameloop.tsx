import { useFrame } from '@react-three/fiber/webgpu';
import { useWorld } from 'koota/react';
import { applyOrbit, updateFollowTarget, updateOrbitController } from './camera/systems';
import { updateCharacterController, updateCharacterState } from './character/systems';
import { resolveBoxCollisions, resolveBoxPlaneCollisions } from './physics/systems';
import { updateWanderInput } from './pig/systems';
import { useKeyboard, usePointer, useWheel } from './input/hooks';
import { resetInputDelta } from './input/systems';
import { updatePlayerInput } from './player/systems';
import { updateTime } from './time/systems';

// The tick. Every system runs here, in one order, before the views read the world.
export function Frameloop() {
  const world = useWorld();
  useKeyboard(world);
  usePointer(world);
  useWheel(world);

  useFrame(
    () => {
      updateTime(world);

      updatePlayerInput(world);
      updateWanderInput(world);
      updateCharacterController(world);
      resolveBoxPlaneCollisions(world);
      resolveBoxCollisions(world);
      updateCharacterState(world);

      updateFollowTarget(world);
      updateOrbitController(world);
      applyOrbit(world);

      resetInputDelta(world);
    },
    { before: 'update' }
  );

  return null;
}
