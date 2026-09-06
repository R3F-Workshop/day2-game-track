import { createActions } from 'koota';
import { blockActions } from './block/actions';
import { cameraActions } from './camera/actions';
import { characterActions } from './character/stateMachine';
import { itemActions } from './item/actions';
import { pigActions } from './character/pig/actions';
import { playerActions } from './character/player/actions';
import { ridingActions } from './riding/actions';
import { terrainActions } from './terrain/actions';
import { groundActions } from './terrain/ground/actions';

// Every domain's actions in one place, for the app shell and input to reach.
export const actions = createActions((world) => ({
  ...blockActions(world),
  ...cameraActions(world),
  ...characterActions(world),
  ...itemActions(world),
  ...pigActions(world),
  ...playerActions(world),
  ...ridingActions(world),
  ...terrainActions(world),
  ...groundActions(world),
}));
