# 3. The player entity

The simulation needs to own the player's position before it can move it. Spawn a player entity with a `Position` trait, then draw it with a renderer.

Continue in `src/game` from [lesson 2](../02-frameloop/README.md).

## 1. Define the traits

Create `transform.ts`. Players, cameras and blocks will all need a position.

```ts
import { trait } from 'koota';
import { Vector3 } from 'three';

export const Position = trait(() => new Vector3());
```

A trait can hold an object. The function makes a fresh `Vector3` for each entity so they never share one. The simulation imports math from `three`, while views import from `three/webgpu`.

Create `player/traits.ts`:

```ts
import { trait } from 'koota';

export const Player = trait();
```

A trait with no data is a **tag**. It marks which entity is the player.

## 2. Spawn through an action

Create `player/actions.ts`. An **action** is a function bound to a world that changes it.

```ts
import { createActions } from 'koota';
import { Vector3 } from 'three';
import { Position } from '../transform';
import { Player } from './traits';

export const playerActions = createActions((world) => ({
  spawnPlayer: ({ position = [0, 0, 0] } = {}) => {
    return world.spawn(Player, Position(new Vector3(...position)));
  },
}));
```

`world.spawn` creates an **entity** with the given traits and returns it. `Position(...)` fills in a starting value instead of the default.

Each folder will have its own actions. Create `actions.ts` at the top of `src/game` to gather them in one place.

```ts
import { createActions } from 'koota';
import { playerActions } from './player/actions';

// Every domain's actions in one place.
export const actions = createActions((world) => ({
  ...playerActions(world),
}));
```

In `world.ts`, spawn the player right after creating the world.

```ts
import { createWorld } from 'koota';
import { actions } from './actions'; // <--
import { Time } from './time/traits';

export const world = createWorld(Time);

const { spawnPlayer } = actions(world); // <--
spawnPlayer({ position: [0, 1, 0] }); // <--

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
```

## 3. Capture the mounted object

The entity holds game data. React creates the mesh. A `Ref` trait connects the two so a view system can copy the data into the mesh each frame.

Create `view/traits.ts`:

```ts
import { trait } from 'koota';
import type { Object3D } from 'three/webgpu';

// The mounted Three object for an entity. Only the view uses this trait.
export const Ref = trait((): Object3D | null => null);
```

Create `view/capture-ref.ts`. React calls this callback with the Three object when it mounts, then calls the returned cleanup when it detaches.

```ts
import type { Entity } from 'koota';
import type { Object3D } from 'three/webgpu';
import { Ref } from './traits';

// Capture the mounted object and release it when React detaches the ref.
export function captureRef(entity: Entity) {
  return (object: Object3D | null) => {
    if (!object || !entity.isAlive()) return;

    if (entity.has(Ref)) entity.set(Ref, object);
    else entity.add(Ref(object));

    return () => {
      if (entity.isAlive() && entity.get(Ref) === object) entity.remove(Ref);
    };
  };
}
```

Each entity has one captured object. The cleanup checks that the entity is still alive because the simulation can destroy it before React unmounts its view. It also checks the object so an old cleanup cannot clear a newer ref.

`Ref` belongs to the view. Spawn actions and simulation systems never need it, so the game can still run without React or a scene.

## 4. Render from a query

Create `player/renderer.tsx`. A **query** finds every entity that has a set of traits.

```tsx
import type { Entity } from 'koota';
import { useQuery } from 'koota/react';
import { Position } from '../transform';
import { captureRef } from '../view/capture-ref';
import { Player } from './traits';

export function PlayerRenderer() {
  const players = useQuery(Player, Position);
  return players.map((entity) => <PlayerView key={entity.id()} entity={entity} />);
}

// A stand-in for the player, two units tall like a Minecraft character.
function PlayerView({ entity }: { entity: Entity }) {
  return (
    <mesh ref={captureRef(entity)} castShadow>
      <capsuleGeometry args={[0.3, 1.4, 4, 16]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}
```

`useQuery` keeps the list of views up to date as entities spawn and disappear. `ref={captureRef(entity)}` attaches the mesh to its entity. Query for the game traits, not `Ref`: the ref only exists after the view mounts.

In `app.tsx`, import the renderer and add it inside the Canvas after `<Sun />`.

```tsx
import { Frameloop } from './frameloop';
import { PlayerRenderer } from './player/renderer'; // <--
import { Time } from './time/traits';
```

```tsx
<Sun />

<PlayerRenderer /> {/* <-- */}
<Ground />
```

## 5. Sync before drawing

Create `view/systems.ts`. `readEach` reads the simulation's position and copies it into the captured object. Only the object changes.

```ts
import type { World } from 'koota';
import { Position } from '../transform';
import { Ref } from './traits';

// Copy simulation transforms into mounted objects before rendering.
export function syncTransforms(world: World) {
  world.query(Position, Ref).readEach(([position, object]) => {
    object?.position.copy(position);
  });
}
```

In `frameloop.tsx`, import and run it after the simulation systems:

```tsx
import { useFrame } from '@react-three/fiber/webgpu';
import { useWorld } from 'koota/react';
import { updateTime } from './time/systems';
import { syncTransforms } from './view/systems';

// The tick. Every system runs here, in one order, before the views read the world.
export function Frameloop() {
  const world = useWorld();

  useFrame(
    () => {
      updateTime(world);

      syncTransforms(world);
    },
    { before: 'update' }
  );

  return null;
}
```

This runs every frame, so even an in-place change to the position reaches the mesh. Movement does not need a React render or a trait subscription. Entities without a mounted view are skipped.

## Try it

Open [your practice game](http://localhost:5173/). A pink capsule stands on the grass with a shadow. Until we have a model it stands in for the player, two units tall. Change the spawn position in `world.ts` to `[2, 1, 0]` and reload: the capsule moves sideways. Add a second `spawnPlayer` call at `[-2, 1, 0]`: the same renderer draws both.

Restore one player at `[0, 1, 0]` before continuing. Next we move the camera into the world too.

[Run the completed step](http://localhost:5173/?step=3) · [Next, the camera →](../04-camera/README.md)
