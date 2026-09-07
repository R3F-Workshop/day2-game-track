import { useFrame } from '@react-three/fiber';
import { useWorld } from 'koota/react';
import { applyOrbit, updateFollowTarget, updateOrbitController } from './camera/systems';
import { updateCharacterController, updateCharacterState } from './character/systems';
import { resolveBoxPlaneCollisions } from './physics/systems';
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
      updateCharacterController(world);
      resolveBoxPlaneCollisions(world);
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
