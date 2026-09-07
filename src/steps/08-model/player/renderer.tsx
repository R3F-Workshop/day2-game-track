import { useGLTF } from '@react-three/drei/webgpu';
import type { Entity } from 'koota';
import { useQuery, useTrait } from 'koota/react';
import { useEffect, useMemo } from 'react';
import { Box3, Mesh, Vector3 } from 'three/webgpu';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { BoxCollider } from '../physics/traits';
import { Position, Rotation } from '../transform/traits';
import { Player } from './traits';

// Minecraft idle and walking animation by fabizok, licensed CC BY 4.0
// https://sketchfab.com/3d-models/minecraft-idle-and-walking-animation-a3f0270cc1ef42d59be153204d03b0f8
const MODEL_URL = '/minecraft-character/source/model.gltf';

export function PlayerRenderer() {
  const players = useQuery(Player, Position);
  return players.map((entity) => <PlayerView key={entity.id()} entity={entity} />);
}

function PlayerView({ entity }: { entity: Entity }) {
  const { scene } = useGLTF(MODEL_URL);
  // The loaded scene is shared. A skinned mesh needs its bones cloned along with it.
  const model = useMemo(() => clone(scene), [scene]);

  // The entity's Position is the middle of its collider, so shift the model to stand on the
  // collider's bottom, centered.
  const box = useTrait(entity, BoxCollider);
  const modelOffset = useMemo(() => {
    const bounds = new Box3().setFromObject(model);
    const center = bounds.getCenter(new Vector3());

    return [-center.x, -bounds.min.y - (box?.size.y ?? 0) / 2, -center.z] as const;
  }, [box, model]);

  const position = useTrait(entity, Position);
  const rotation = useTrait(entity, Rotation);

  useEffect(() => {
    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;

      object.castShadow = true;
      object.receiveShadow = true;
    });
  }, [model]);

  return (
    <group position={position?.toArray()} quaternion={rotation?.toArray()}>
      <primitive object={model} position={modelOffset} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
