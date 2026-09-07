import { createActions, type Entity, type TagTrait } from 'koota';
import { IsAirborne, IsIdle, IsWalking } from './traits';

export const characterActions = createActions(() => ({
  // Swaps the character into a state, so it is never in two at once.
  transitionCharacter: (entity: Entity, state: TagTrait) => {
    if (entity.has(state)) return;

    entity.remove(IsIdle, IsWalking, IsAirborne);
    entity.add(state);
  },
}));
