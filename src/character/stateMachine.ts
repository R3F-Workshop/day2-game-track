import { createActions, Not, trait, type Entity, type TagTrait, type World } from 'koota';
import { CharacterController } from '../controllers/characterController';
import { IsGrounded, Velocity } from '../physics/traits';

// Character states, exclusive: see transitionCharacter.
export const IsIdle = trait();
export const IsWalking = trait();
export const IsAirborne = trait();
export const IsRiding = trait();

export const characterActions = createActions(() => ({
  transitionCharacter: (entity: Entity, state: TagTrait) => {
    if (entity.has(state)) return;

    entity.remove(IsIdle, IsWalking, IsAirborne, IsRiding);
    entity.add(state);
  },
}));

export function updateCharacterState(world: World) {
  const { transitionCharacter } = characterActions(world);

  // Riders leave this state machine until they dismount.
  world.query(CharacterController, Velocity, Not(IsRiding)).readEach(([, velocity], entity) => {
    if (!entity.has(IsGrounded)) {
      transitionCharacter(entity, IsAirborne);
      return;
    }

    const horizontalSpeed = Math.hypot(velocity.x, velocity.z);
    const state = horizontalSpeed > 0.1 ? IsWalking : IsIdle;

    transitionCharacter(entity, state);
  });
}
