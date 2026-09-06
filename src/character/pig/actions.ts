import { createActions } from 'koota';
import { random } from 'math/random';
import { Vector3 } from 'three';
import { CharacterController, Input } from '../../controllers/characterController';
import { IsIdle } from '../stateMachine';
import { Wander } from '../wander';
import { BoxCollider, Velocity } from '../../physics/traits';
import { Player } from '../player/traits';
import { Rideable } from '../../riding/traits';
import { Position, Rotation } from '../../transform/traits';
import { Pig } from './traits';

export const pigActions = createActions((world) => {
  const spawnPig = ({ position = [0, 0, 0] } = {}) => {
    return world.spawn(
      Pig,
      Wander,
      Rideable,
      // Faster than the player when ridden. Wander scales the heading down so loose pigs amble.
      CharacterController({ maxSpeed: 7, acceleration: 40, turnSpeed: 6 }),
      IsIdle,
      Input,
      Position(new Vector3(position[0], position[1], position[2])),
      Rotation,
      Velocity,
      // Minecraft's pig hitbox.
      BoxCollider({ size: new Vector3(0.9, 0.9, 0.9) })
    );
  };

  return {
    spawnPig,
    // Drops a pig a few blocks from the player in a random direction.
    spawnPigNearPlayer: ({ minDistance = 2, maxDistance = 4 } = {}) => {
      const player = world.queryFirst(Player, Position);
      if (!player) return;

      const origin = player.get(Position)!;
      const angle = random.float(Math.random, 0, Math.PI * 2);
      const distance = random.float(Math.random, minDistance, maxDistance);

      return spawnPig({
        position: [
          origin.x + Math.cos(angle) * distance,
          origin.y + 1,
          origin.z + Math.sin(angle) * distance,
        ],
      });
    },
  };
});
