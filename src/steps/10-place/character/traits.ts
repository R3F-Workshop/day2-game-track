import { trait } from 'koota';

// How a character moves. Speeds are units per second, and the rates are how fast the velocity
// changes toward the input while moving and toward zero while not.
export const CharacterController = trait({
  maxSpeed: 5,
  acceleration: 50,
  friction: 70,
  gravity: -24,
  jumpSpeed: 8,
  // How quickly the character faces where it is going, in e-folds per second.
  turnSpeed: 10,
});
// What the character wants to do this tick. x is right and y is forward, each -1 to 1.
export const Input = trait({ x: 0, y: 0, jump: false });

// What a character is doing. One at a time: see transitionCharacter.
export const IsIdle = trait();
export const IsWalking = trait();
export const IsAirborne = trait();
