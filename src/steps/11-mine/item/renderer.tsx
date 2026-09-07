import { useGLTF } from '@react-three/drei/webgpu';
import { useMemo } from 'react';
import { Mesh } from 'three/webgpu';

// Minecraft Diamond Axe by Blender3D, licensed CC BY 4.0
// https://sketchfab.com/3d-models/minecraft-diamond-axe-0d62f4d3676545c88ec8523213c055dd
const AXE_URL = '/axe.glb';

// Hangs from the character's right arm joint, gripped the way Minecraft holds a tool.
export function HeldAxe() {
  return (
    <group position={[0, -0.66, -0.04]} rotation={[-2.35, 0, -0.2]} scale={1.25}>
      <group rotation={[0, Math.PI / 1.8, -0.3]} scale={0.5}>
        <Axe />
      </group>
    </group>
  );
}

function Axe() {
  const { scene } = useGLTF(AXE_URL);
  // The loaded scene is shared, so each hand gets its own copy of the object tree.
  const model = useMemo(() => {
    const copy = scene.clone();
    copy.traverse((object) => {
      if (object instanceof Mesh) object.castShadow = true;
    });
    return copy;
  }, [scene]);

  return <primitive object={model} />;
}

useGLTF.preload(AXE_URL);
