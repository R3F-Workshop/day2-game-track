# minecraft-like

This project was generated with create-krispya

## Project Architecture

This project uses [Vite](https://vitejs.dev/) as the bundler for fast development and optimized production builds.

- `src/app.tsx` defines the main application component containing your 3D content
- `src/main.tsx` renders the React app into the DOM
- `src/frameloop.tsx` runs every system in tick order, and `src/actions.ts` gathers every domain's actions
- Static assets can be placed in the `public` folder

### Domains

`src/` is split by domain, one folder per concept: `transform`, `physics`, `input`, `time`, `character`, `riding`, `camera`, `block`, `terrain`, `item`. Each folder holds everything about its concept:

- `traits.ts` is the data, the domain's public vocabulary
- `actions.ts` is how the data is changed, the domain's public API
- `systems.ts` advances the data every tick, and subscribes to the events it reacts to
- `renderer.tsx` reflects the data into React Three Fiber
- other files provide helpers, like `block/grid.ts` or `terrain/noise.ts`

Domains may import each other's traits and actions. Systems and renderers are private to their domain. The core stays headless: React appears only in renderers and in the input hooks that feed the world.

`controllers/` groups the headless behavior modules `orbitController.ts`, `firstPersonController.ts`, and `characterController.ts`. Each module owns its controller traits and the systems that drive them. `camera/` owns shared follow and perspective traits, camera spawning, and perspective switching. `character/` groups shared character behavior and the player and pig implementations. `stateMachine.ts` contains movement state traits, transitions, and state updates. `wander.ts` contains wandering traits and the input system. `player/` and `pig/` each retain their spawning, traits, and rendering code, with player input in `player/systems.ts`.

`terrain/` groups the permanent ground plane and generated block terrain. `ground/` contains the plane's trait, spawn action, and renderer. Terrain generation stays in the parent directory, and generated blocks use the shared block renderer.

## Libraries

The following libraries are used - checkout the linked docs to learn more

- [React](https://react.dev/) - A JavaScript library for building user interfaces
- [Three.js](https://threejs.org/) - JavaScript 3D library
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) - lets you create Three.js scenes using React components
- [@react-three/drei](https://drei.docs.pmnd.rs/) - Useful helpers for @react-three/fiber
- [koota](https://github.com/pmndrs/koota) - ECS-based state management library optimized for real-time apps, games, and XR experiences
- [math](https://github.com/pmndrs/math) - Random sampling, seeded generators, and terrain interpolation and fractal helpers

## Tools

- [Oxlint](https://oxc.rs/docs/guide/usage/linter) - A fast linter for JavaScript and TypeScript
- [Prettier](https://prettier.io/) - Opinionated code formatter

## Development Commands

- `pnpm install` to install the dependencies
- `pnpm run dev` to run the development server and preview the app with live updates
- `pnpm run build` to build the app into the `dist` folder
- `pnpm run test` to run the tests
