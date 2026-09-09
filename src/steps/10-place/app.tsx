import { Sky } from '@react-three/drei/webgpu';
import { Canvas } from '@react-three/fiber/webgpu';
import { useTrait, useWorld, WorldProvider } from 'koota/react';
import { output, vec4 } from 'three/tsl';
import { BlockRenderer } from './block/renderer';
import { CameraRenderer } from './camera/renderer';
import { Frameloop } from './frameloop';
import { GroundRenderer } from './ground/renderer';
import { PlayerRenderer } from './player/renderer';
import { Time } from './time/traits';
import { world } from './world';

export function App() {
  return (
    <WorldProvider world={world}>
      <Canvas shadows>
        <Sky
          sunPosition={[100, 20, 100]}
          material-outputNode={vec4(output.rgb.pow(1 / 2.4), output.a)}
        />
        <ambientLight intensity={0.3 * Math.PI} />
        <Sun />

        <PlayerRenderer />
        <GroundRenderer />
        <BlockRenderer />
        <CameraRenderer />
      </Canvas>

      <Frameloop />
      <Clock />
    </WorldProvider>
  );
}

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

// One directional light casts shadows inside a box around the origin.
function Sun() {
  return (
    <directionalLight
      castShadow
      intensity={0.8 * Math.PI}
      position={[100, 100, 100]}
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-20}
      shadow-camera-right={20}
      shadow-camera-top={20}
      shadow-camera-bottom={-20}
      shadow-camera-near={100}
      shadow-camera-far={250}
      shadow-bias={-0.00001}
      shadow-normalBias={0.02}
      shadow-radius={2}
    />
  );
}
