# 7. Jump

Next we will add gravity and a jump. The player stands at `y = 1` only because nothing ever changes that number. We'll add gravity and a jump to the controller, give the player and the ground colliders, and write the first physics system, the one that keeps the player from falling through the floor.

Continue in `src/game` from [lesson 6](../06-controller/README.md).

## 1. Model the colliders

In `physics/traits.ts`, add three traits after `Velocity`.

```ts
// A box around the entity's Position that stays lined up with the world axes.
export const BoxCollider = trait({ size: () => new Vector3(1, 1, 1) });
// A flat floor through the entity's Position, facing up.
export const PlaneCollider = trait();
// Standing on something this tick.
export const IsGrounded = trait();
```

`IsGrounded` is a tag that physics adds and removes. The controller reads it to decide whether a jump is allowed.

## 2. Make the ground an entity

The ground has been a mesh in `app.tsx`. To collide with it, the simulation needs to know it exists. Create `ground/traits.ts`:

```ts
import { trait } from 'koota';

export const Ground = trait();
```

Create `ground/actions.ts`:

```ts
import { createActions } from 'koota';
import { PlaneCollider } from '../physics/traits';
import { Position } from '../transform/traits';
import { Ground } from './traits';

export const groundActions = createActions((world) => ({
  spawnGround: () => {
    return world.spawn(Ground, PlaneCollider, Position);
  },
}));
```

Create `ground/renderer.tsx`. It is the old `Ground` component, keyed to the entity and positioned from its trait.

```tsx
import { useTexture } from '@react-three/drei';
import type { Entity } from 'koota';
import { useQueryFirst, useTrait } from 'koota/react';
import { RepeatWrapping } from 'three';
import { Position } from '../transform/traits';
import { Ground } from './traits';

export function GroundRenderer() {
  const ground = useQueryFirst(Ground, Position);
  return ground ? <GroundView key={ground.id()} entity={ground} /> : null;
}

function GroundView({ entity }: { entity: Entity }) {
  const texture = useTexture('/grass.jpg');
  texture.wrapS = texture.wrapT = RepeatWrapping;
  const position = useTrait(entity, Position);

  return (
    <mesh receiveShadow position={position?.toArray()} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} map-repeat={[240, 240]} color="green" />
    </mesh>
  );
}
```

Add the actions to `actions.ts`:

```ts
import { cameraActions } from './camera/actions';
import { groundActions } from './ground/actions'; // <--
import { playerActions } from './player/actions';

// Every domain's actions in one place.
export const actions = createActions((world) => ({
  ...cameraActions(world),
  ...groundActions(world), // <--
  ...playerActions(world),
}));
```

In `app.tsx`, import `GroundRenderer`, use it in place of `<Ground />`, and delete the old `Ground` component along with the `useTexture` and `RepeatWrapping` imports.

```tsx
import { Sky } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useTrait, useWorld, WorldProvider } from 'koota/react';
import { CameraRenderer } from './camera/renderer';
import { Frameloop } from './frameloop';
import { GroundRenderer } from './ground/renderer'; // <--
```

```tsx
<PlayerRenderer />
<GroundRenderer />
<CameraRenderer />
```

## 3. Land on the floor

Create `physics/systems.ts`. Each tick, any box that sank below a floor gets lifted back on top of it.

```ts
import type { World } from 'koota';
import { Position } from '../transform/traits';
import { BoxCollider, IsGrounded, PlaneCollider, Velocity } from './traits';

// Lifts every box that sank into a floor back on top of it, and marks it as standing.
export function resolveBoxPlaneCollisions(world: World) {
  const planes = world.query(PlaneCollider, Position);

  world.query(Position, Velocity, BoxCollider).updateEach(([position, velocity, box], entity) => {
    let isGrounded = false;

    planes.readEach(([planePosition]) => {
      const bottom = position.y - box.size.y / 2;
      if (bottom > planePosition.y) return;

      position.y += planePosition.y - bottom;
      // Stop falling, but keep any upward motion like the start of a jump.
      if (velocity.y < 0) velocity.y = 0;
      isGrounded = true;
    });

    if (isGrounded) entity.add(IsGrounded);
    else entity.remove(IsGrounded);
  });
}
```

`readEach` is `updateEach` without the write-back, for traits the loop only reads. Grounded is decided fresh every tick: a box that is not touching a floor is in the air, whatever it was doing before.

## 4. Fall and jump

In `character/traits.ts`, add gravity and a jump speed to the controller, and a jump to the input.

```ts
export const CharacterController = trait({
  maxSpeed: 5,
  acceleration: 50,
  friction: 70,
  gravity: -24, // <--
  jumpSpeed: 8, // <--
});
// What the character wants to do this tick. x is right and y is forward, each -1 to 1.
export const Input = trait({ x: 0, y: 0, jump: false }); // <--
```

Minecraft's gravity is stronger than Earth's, which is what makes jumps feel snappy.

In `character/systems.ts`, import `IsGrounded` and take the entity in the callback.

```ts
import { IsGrounded, Velocity } from '../physics/traits';
```

```ts
.updateEach(([controller, input, position, velocity], entity) => {
```

Replace the `rate` line. In the air there is nothing to push against, so the velocity carries.

```ts
let isGrounded = entity.has(IsGrounded);
// Nothing to push against in the air, so the velocity carries.
const rate = hasInput ? controller.acceleration : isGrounded ? controller.friction : 0;
```

Before the position update, add the jump and gravity, and integrate `y` along with the rest.

```ts
if (isGrounded && input.jump) {
  velocity.y = controller.jumpSpeed;
  isGrounded = false;
  entity.remove(IsGrounded);
}

if (!isGrounded) velocity.y += controller.gravity * delta;

position.x += velocity.x * delta;
position.y += velocity.y * delta; // <--
position.z += velocity.z * delta;
```

A jump only sets a velocity. Gravity brings the player back down.

## 5. Wire it up

In `player/systems.ts`, read the space bar after normalizing the keys.

```ts
const localX = x / length;
const localY = y / length;
input.jump = keys.has(' '); // <--
```

In `player/actions.ts`, give the player a collider.

```ts
import { BoxCollider, Velocity } from '../physics/traits'; // <--
```

```ts
Position(new Vector3(...position)),
Velocity,
// Minecraft's player hitbox.
BoxCollider({ size: new Vector3(0.6, 2, 0.6) }) // <--
```

In `world.ts`, spawn the ground and drop the player in from above.

```ts
const { spawnPlayer, spawnCamera, spawnGround } = actions(world); // <--
spawnGround(); // <--
// Drop in from above to see gravity at work.
const player = spawnPlayer({ position: [0, 4, 0] }); // <--
```

In `frameloop.tsx`, resolve collisions right after the controller moves things.

```tsx
import { resolveBoxPlaneCollisions } from './physics/systems'; // <--
```

```tsx
updatePlayerInput(world);
updateCharacterController(world);
resolveBoxPlaneCollisions(world); // <--
```

Run `pnpm dev` and open [your practice game](http://localhost:5173/). The capsule falls, lands, and jumps with the space bar. Jump while walking and let go of the key: you keep moving until you land. Change `gravity` to `-9.81` to feel the difference from Earth.

[Run the completed step](http://localhost:5173/?step=7) · [Next, the model →](../08-model/README.md)
