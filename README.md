# A Minecraft-like game, step by step

We are going to build a small Minecraft-like game from scratch: a world to walk around in, blocks to place and break, and pigs to keep you company. The only libraries are [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) and [Three.js](https://threejs.org/) for drawing, [drei](https://drei.docs.pmnd.rs/) for a few loaders and helpers, and [Koota](https://github.com/pmndrs/koota) for the game data.

Start with [lesson 1](src/steps/01-stage/README.md) and edit the [src/game](src/game/) folder throughout all twelve lessons. Each guide shows every edit needed for the next step. The numbered folders in [src/steps](src/steps/) contain the completed examples.

Run `pnpm dev` and open [your practice game](http://localhost:5173/). The bar at the top switches to [any completed step](http://localhost:5173/?step=1). Once the game runs, the numbers in each `traits.ts` are the knobs: change a speed or a size and reload.

## Day one

Three ideas carry the whole course. Read them once now. Each lesson brings one back the moment the code needs it.

### Simulation, view, input

A game is a **simulation**. It has data, like where the player stands, and rules that change the data, like gravity. The **view** draws the data. It never changes it. The player's **input** feeds the simulation, which decides what to make of it.

Keeping the three apart is the whole architecture. The simulation can run with no screen at all, and the view can be thrown away and redrawn from the data at any time.

### Entities, traits, systems

We keep the data in Koota, an entity component system. The vocabulary:

| Word       | Meaning                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| **World**  | Holds every entity, plus a few shared traits like the clock              |
| **Entity** | An ID that traits attach to                                              |
| **Trait**  | Data attached to an entity, like `Position`. Other engines say component |
| **Query**  | Finds every entity that has a set of traits                              |
| **System** | A function that queries entities and updates their traits, once per tick |
| **Action** | A function bound to a world that changes it, like spawning a player      |

Actions are the API for changing the world from outside a system, the way mutations are for a database. Systems are the rules that run every tick.

### Real time

Nothing waits for the player. A clock ticks, the simulation advances, and the screen redraws, sixty or more times a second. On a 60 Hz screen each frame has 16.67 ms. On a 120 Hz screen it has 8.33 ms. Everything a tick does has to fit.

The loop that runs each tick is the **frame loop**. Every system runs inside it.

## Lessons

1. [Stage](src/steps/01-stage/README.md) draws a ground, a sky and a stand-in player the usual React Three Fiber way.
2. [Frame loop](src/steps/02-frameloop/README.md) creates the world, a `Time` trait, the first system and a clock on screen.
3. [Player](src/steps/03-player/README.md) spawns the player as an entity and draws it from a query.
4. [Camera](src/steps/04-camera/README.md) makes the camera an entity too.
5. [Orbit](src/steps/05-orbit/README.md) reads the pointer and wheel and orbits the camera.
6. [Controller](src/steps/06-controller/README.md) reads the keyboard, moves the player and has the camera follow.
7. [Jump](src/steps/07-jump/README.md) adds gravity, a jump and a floor to land on.
8. [Model](src/steps/08-model/README.md) swaps the capsule for the Minecraft character and turns it to face where it walks.
9. [Animation](src/steps/09-animation/README.md) names what the character is doing and plays the matching clip.
10. [Place](src/steps/10-place/README.md) places blocks with a right click and makes them solid.
11. [Mine](src/steps/11-mine/README.md) puts an axe in hand and breaks blocks with a left click.
12. [Pig](src/steps/12-pig/README.md) adds pigs that wander on the same controller as the player.

## Where we end up

Every folder in `src/game` is one concept. `traits.ts` is its data, `actions.ts` is how the data is changed, `systems.ts` advances it every tick, and `renderer.tsx` draws it. Nothing else knows about React.

```
src/game
├── app.tsx           the Canvas, lights and every renderer
├── world.ts          creates the world and spawns the starting entities
├── frameloop.tsx     runs every system in order, once per tick
├── actions.ts        every domain's actions in one place
├── time              Time
├── input             Keys, Pointer, Wheel and the hooks that fill them
├── transform         Position, Rotation
├── physics           Velocity, colliders, IsGrounded
├── camera            Camera, Follows, OrbitController
├── character         CharacterController, Input and the states
├── player            Player, its spawn, its input and its model
├── ground            Ground
├── block             Block, BlockDamage, placing
├── item              ToolSwing, hitting
└── pig               Pig, Wander
```

## Credits

The [Minecraft character](https://sketchfab.com/3d-models/minecraft-idle-and-walking-animation-a3f0270cc1ef42d59be153204d03b0f8), [diamond axe](https://sketchfab.com/3d-models/minecraft-diamond-axe-0d62f4d3676545c88ec8523213c055dd) and [saddled pig](https://sketchfab.com/3d-models/minecraft-saddled-pig-22a686ae544e41bfa640bc757e61d7a9) are from Sketchfab under CC BY 4.0.
