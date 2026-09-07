import { createActions } from 'koota';
import { cameraActions } from './camera/actions';
import { groundActions } from './ground/actions';
import { playerActions } from './player/actions';

// Every domain's actions in one place.
export const actions = createActions((world) => ({
  ...cameraActions(world),
  ...groundActions(world),
  ...playerActions(world),
}));
