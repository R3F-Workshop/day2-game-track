import { Sky, useTexture } from '@react-three/drei/webgpu';
import { Canvas } from '@react-three/fiber/webgpu';
import { output, vec4 } from 'three/tsl';
import { RepeatWrapping } from 'three/webgpu';

export function App() {
  return (
    <Canvas shadows camera={{ position: [4, 1.5, 6], fov: 45 }}>
      <Sky
        sunPosition={[100, 20, 100]}
        material-outputNode={vec4(output.rgb.pow(1 / 2.4), output.a)}
      />
      <ambientLight intensity={0.3 * Math.PI} />
      <Sun />

      <Ground />
    </Canvas>
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

function Ground() {
  const texture = useTexture('/grass.jpg');
  texture.wrapS = texture.wrapT = RepeatWrapping;

  return (
    <mesh receiveShadow rotation-x={-Math.PI / 2}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} map-repeat={[240, 240]} color="green" />
    </mesh>
  );
}
