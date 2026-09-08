import { createActions } from 'koota';
import { Vector3 } from 'three';
import { Position } from '../transform';
import { Player } from './traits';

export const playerActions = createActions((world) => ({
  spawnPlayer: ({ position = [0, 0, 0] } = {}) => {
    return world.spawn(Player, Position(new Vector3(...position)));
  },
}));
