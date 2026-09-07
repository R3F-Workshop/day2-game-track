import type { Entity } from 'koota';
import { useQuery, useTrait } from 'koota/react';
import { Position } from '../transform/traits';
import { Player } from './traits';

export function PlayerRenderer() {
  const players = useQuery(Player, Position);
  return players.map((entity) => <PlayerView key={entity.id()} entity={entity} />);
}

// A stand-in for the player, two units tall like a Minecraft character.
function PlayerView({ entity }: { entity: Entity }) {
  const position = useTrait(entity, Position);

  return (
    <mesh castShadow position={position?.toArray()}>
      <capsuleGeometry args={[0.3, 1.4, 4, 16]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}
