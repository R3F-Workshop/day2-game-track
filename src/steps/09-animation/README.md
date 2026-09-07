# 9. Animate the character

Next we will animate the character. The model comes with an idle and a walk clip, and the view should play whichever fits. But the view should not guess from velocity whether the character is walking. That is the simulation's call. We'll give characters a state, a system that sets it, and an animation hook that follows it.

Continue in `src/game` from [lesson 8](../08-model/README.md).

## 1. Model the states

In `character/traits.ts`, add three tags at the end.

```ts
// What a character is doing. One at a time: see transitionCharacter.
export const IsIdle = trait();
export const IsWalking = trait();
export const IsAirborne = trait();
```

A state machine in an ECS is a set of tags where an entity has exactly one. Queries can then ask for every walking character, and views can subscribe to a single tag.

Create `character/actions.ts` to enforce the one-at-a-time rule.

```ts
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
```

Add it to `actions.ts`:

```ts
import { cameraActions } from './camera/actions';
import { characterActions } from './character/actions'; // <--
import { groundActions } from './ground/actions';
```

```ts
...cameraActions(world),
...characterActions(world), // <--
...groundActions(world),
```

## 2. Decide the state each tick

In `character/systems.ts`, import the actions and tags.

```ts
import { characterActions } from './actions'; // <--
import { CharacterController, Input, IsAirborne, IsIdle, IsWalking } from './traits'; // <--
```

Add `updateCharacterState` at the end of the file. It runs after physics, so it sees where the character actually ended up.

```ts
// Reads what the physics settled on this tick and names it.
export function updateCharacterState(world: World) {
  const { transitionCharacter } = characterActions(world);

  world.query(CharacterController, Velocity).readEach(([, velocity], entity) => {
    if (!entity.has(IsGrounded)) {
      transitionCharacter(entity, IsAirborne);
      return;
    }

    const horizontalSpeed = Math.hypot(velocity.x, velocity.z);
    transitionCharacter(entity, horizontalSpeed > 0.1 ? IsWalking : IsIdle);
  });
}
```

Systems can call actions. `transitionCharacter` returns early when nothing changes, so subscribers only hear about real transitions.

In `player/actions.ts`, spawn the player idle.

```ts
import { CharacterController, Input, IsIdle } from '../character/traits'; // <--
```

```ts
Player,
CharacterController,
IsIdle, // <--
Input,
```

In `frameloop.tsx`, run it after collisions.

```tsx
import { updateCharacterController, updateCharacterState } from './character/systems'; // <--
```

```tsx
updateCharacterController(world);
resolveBoxPlaneCollisions(world);
updateCharacterState(world); // <--
```

## 3. Play the matching clip

In `player/renderer.tsx`, replace the imports above `Position` with these. The new names are the animation types, `useTag`, `useRef`, `useFrame` and `Velocity`.

```tsx
import { useAnimations, useGLTF } from '@react-three/drei'; // <--
import { useFrame } from '@react-three/fiber'; // <--
import type { Entity } from 'koota';
import { useQuery, useTag, useTrait } from 'koota/react'; // <--
import { useEffect, useMemo, useRef } from 'react'; // <--
import {
  type AnimationAction,
  type AnimationClip,
  Box3,
  MathUtils,
  Mesh,
  type Object3D,
  Vector3,
} from 'three'; // <--
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { IsWalking } from '../character/traits'; // <--
import { BoxCollider, Velocity } from '../physics/traits'; // <--
```

Take the clips from the file and call the hook inside `PlayerView`, after the traits.

```tsx
const { scene, animations } = useGLTF(MODEL_URL);
```

```tsx
const position = useTrait(entity, Position);
const rotation = useTrait(entity, Rotation);

useCharacterAnimation(entity, animations, model); // <--
```

Add the hook below `PlayerView`. It cross-fades on state changes and, every frame, scales the walk cycle to the actual speed so the feet do not slide.

```tsx
// Plays the clip for the character's state. The model has no jump clip, so in the air it idles.
function useCharacterAnimation(entity: Entity, animations: AnimationClip[], model: Object3D) {
  const { actions } = useAnimations(animations, model);
  const isWalking = useTag(entity, IsWalking);
  const active = useRef<AnimationAction | null>(null);

  // Cross-fade whenever the state changes.
  useEffect(() => {
    const next = actions[isWalking ? 'walking_test' : 'still_test'];
    if (!next || next === active.current) return;

    next.reset().fadeIn(0.15).play();
    active.current?.fadeOut(0.15);
    active.current = next;
  }, [actions, isWalking]);

  useEffect(() => {
    return () => {
      active.current?.stop();
      active.current = null;
    };
  }, []);

  // Match the stride to the speed. One walk cycle covers about two units of ground.
  useFrame(() => {
    const walk = actions.walking_test;
    const velocity = entity.get(Velocity);
    if (!walk || !velocity) return;

    const horizontalSpeed = Math.hypot(velocity.x, velocity.z);
    const cyclesPerSecond = horizontalSpeed / 2;
    walk.timeScale = MathUtils.clamp(cyclesPerSecond * walk.getClip().duration, 1, 8);
  });
}
```

`useTag` subscribes to one tag, so the effect runs exactly when the character starts or stops walking. The `useFrame` here is the view's own loop. It reads the world and touches only the animation, never the data.

Run `pnpm dev` and open [your practice game](http://localhost:5173/). The character idles, walks when you do, and blends between the two. Tap a key and let go: the fade hides the seam. Set `maxSpeed` to `12` and watch the stride speed up with it.

[Run the completed step](http://localhost:5173/?step=9) · [Next, place blocks →](../10-place/README.md)
