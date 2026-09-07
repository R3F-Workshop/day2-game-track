import { createActions } from 'koota';
import { playerActions } from './player/actions';

// Every domain's actions in one place.
export const actions = createActions((world) => ({
  ...playerActions(world),
}));
