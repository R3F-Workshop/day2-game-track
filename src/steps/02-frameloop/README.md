# 2. The frame loop

Next we will create the world that holds the game's data, give it a clock, and write the frame loop that advances it every tick. Nothing else can move until the loop does.

Continue in `src/game` from [lesson 1](../01-stage/README.md). Koota is already installed.

## 1. Model time

The first piece of data is time itself. Create `time/traits.ts`:

```ts
import { trait } from 'koota';

// Seconds since the last tick, and the clock reading of this tick in milliseconds.
export const Time = trait({ delta: 0, current: 0 });
```

A **trait** is a definition with default values. This one will live on the world rather than on an entity, since there is only one clock.

## 2. Create the world

Create `world.ts`. The **world** holds every entity and the shared traits.

```ts
import { createWorld } from 'koota';
import { Time } from './time/traits';

export const world = createWorld(Time);

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
```

The last line cleans up during hot reload, so an edit does not leave an old world ticking.

## 3. Advance time each tick

A **system** is a plain function that takes the world and updates it. Create `time/systems.ts`:

```ts
import type { World } from 'koota';
import { Time } from './traits';

export function updateTime(world: World) {
  const time = world.get(Time)!;

  // The first tick has nothing to measure against.
  if (time.current === 0) time.current = performance.now();

  const now = performance.now();
  const delta = now - time.current;

  // Cap the step so a stalled tab does not launch everything on the next frame.
  time.delta = Math.min(delta / 1000, 1 / 30);
  time.current = now;

  world.set(Time, time);
}
```

`delta` is how long the last frame took, in seconds. Every rate in the game gets multiplied by it, so a 120 Hz screen and a 60 Hz screen move things the same distance per second. `world.set` writes the trait back and notifies anything subscribed to it.

## 4. Write the frame loop

Create `frameloop.tsx`. The loop is a component so it can use Fiber's `useFrame`, but it renders nothing.

```tsx
import { useFrame } from '@react-three/fiber';
import { useWorld } from 'koota/react';
import { updateTime } from './time/systems';

// The tick. Every system runs here, in one order, before the views read the world.
export function Frameloop() {
  const world = useWorld();

  useFrame(
    () => {
      updateTime(world);
    },
    { before: 'update' }
  );

  return null;
}
```

Views also use `useFrame`, in the default `update` phase. Running the loop `before` it means every system has finished before anything is drawn. Each lesson adds its systems to this one callback. The order they run in is a property of the whole game, so it lives in one place.

## 5. Provide the world and show the clock

In `app.tsx`, import the pieces.

```tsx
import { Sky, useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useTrait, useWorld, WorldProvider } from 'koota/react'; // <--
import { RepeatWrapping } from 'three';
import { Frameloop } from './frameloop'; // <--
import { Time } from './time/traits'; // <--
import { world } from './world'; // <--
```

Wrap everything in `WorldProvider` so the hooks can find the world, and add the loop and a clock beside the Canvas. Comments with `...` stand for existing code to keep.

```tsx
export function App() {
  return (
    <WorldProvider world={world}>
      <Canvas shadows camera={{ position: [4, 3, 6], fov: 45 }}>
        {/* ... */}
      </Canvas>

      <Frameloop /> {/* <-- */}
      <Clock /> {/* <-- */}
    </WorldProvider>
  );
}
```

`Frameloop` sits outside the Canvas. The simulation is not part of the scene. It only shares the frame.

Add `Clock` below `App`. It is our first view: it reads a trait and draws it.

```tsx
function Clock() {
  const world = useWorld();
  const time = useTrait(world, Time);

  if (!time) return null;

  return (
    <div style={{ position: 'absolute', top: 8, left: 8, color: 'white', fontFamily: 'monospace' }}>
      <div>Time: {(time.current / 1000).toFixed(2)} s</div>
      <div>Delta: {(time.delta * 1000).toFixed(2)} ms</div>
    </div>
  );
}
```

`useTrait` subscribes, so the clock re-renders every time `updateTime` sets `Time`.

Run `pnpm dev` and open [your practice game](http://localhost:5173/). The clock counts up in the corner. Delta hovers around 16.67 ms on a 60 Hz screen and 8.33 ms on a 120 Hz one. Switch to another tab for a few seconds and come back: the first delta is capped at 33 ms.

[Run the completed step](http://localhost:5173/?step=2) · [Next, the player →](../03-player/README.md)
