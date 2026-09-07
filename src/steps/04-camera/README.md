# 4. The camera entity

Next we will do the same for the camera. It is still a Canvas prop, and the next two lessons make it orbit and follow, which is simulation work. We'll make the camera an entity with a position and a rotation, and a renderer that turns it into the scene's camera.

Continue in `src/game` from [lesson 3](../03-player/README.md).

## 1. Add rotation

A camera needs to face somewhere. In `transform/traits.ts`, add `Rotation` after `Position`.

```ts
import { trait } from 'koota';
import { Quaternion, Vector3 } from 'three'; // <--

export const Position = trait(() => new Vector3());
export const Rotation = trait(() => new Quaternion()); // <--
```

A quaternion is how Three stores a rotation. Three builds them from angles, axes or a direction to look in, as the next section does.

## 2. Spawn the camera

Create `camera/traits.ts`:

```ts
import { trait } from 'koota';

export const Camera = trait();
```

Create `camera/actions.ts`. The action takes a position and a point to look at, and turns that into a rotation.

```ts
import { createActions } from 'koota';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { Position, Rotation } from '../transform/traits';
import { Camera } from './traits';

export const cameraActions = createActions((world) => ({
  spawnCamera: ({ position = [0, 0, 0], target = [0, 0, 0] } = {}) => {
    const eye = new Vector3(...position);
    // A rotation is a quaternion. Build it from the direction the camera should face.
    const lookAt = new Matrix4().lookAt(eye, new Vector3(...target), new Vector3(0, 1, 0));
    const rotation = new Quaternion().setFromRotationMatrix(lookAt);

    return world.spawn(Camera, Position(eye), Rotation(rotation));
  },
}));
```

Add it to `actions.ts`:

```ts
import { createActions } from 'koota';
import { cameraActions } from './camera/actions'; // <--
import { playerActions } from './player/actions';

// Every domain's actions in one place.
export const actions = createActions((world) => ({
  ...cameraActions(world), // <--
  ...playerActions(world),
}));
```

In `world.ts`, spawn it where the Canvas camera used to be, looking at the capsule's middle.

```ts
const { spawnPlayer, spawnCamera } = actions(world);
spawnPlayer({ position: [0, 1, 0] });
spawnCamera({ position: [4, 3, 6], target: [0, 1, 0] }); // <--
```

## 3. Render the camera

Create `camera/renderer.tsx`. It follows the same shape as the player renderer, but the view is a camera instead of a mesh.

```tsx
import { PerspectiveCamera } from '@react-three/drei/webgpu';
import type { Entity } from 'koota';
import { useQuery, useTrait } from 'koota/react';
import { Position, Rotation } from '../transform/traits';
import { Camera } from './traits';

export function CameraRenderer() {
  const cameras = useQuery(Camera, Position, Rotation);
  return cameras.map((entity) => <CameraView key={entity.id()} entity={entity} />);
}

function CameraView({ entity }: { entity: Entity }) {
  const position = useTrait(entity, Position);
  const rotation = useTrait(entity, Rotation);

  return (
    <PerspectiveCamera
      makeDefault
      fov={45}
      position={position?.toArray()}
      quaternion={rotation?.toArray()}
    />
  );
}
```

`makeDefault` tells Fiber to draw the scene through this camera.

In `app.tsx`, import the renderer, drop the `camera` prop from the Canvas, and add the renderer to the scene.

```tsx
import { CameraRenderer } from './camera/renderer'; // <--
import { Frameloop } from './frameloop';
```

```tsx
<Canvas shadows>
```

```tsx
<PlayerRenderer />
<Ground />
<CameraRenderer /> {/* <-- */}
```

Run `pnpm dev` and open [your practice game](http://localhost:5173/). The view is a little higher than before, since the camera now looks at the capsule's middle rather than the ground. Change the spawn position or target in `world.ts` to move it.

[Run the completed step](http://localhost:5173/?step=4) · [Next, orbit →](../05-orbit/README.md)
