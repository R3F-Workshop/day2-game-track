import type { Entity } from 'koota';
import { useQuery } from 'koota/react';
import { Position } from '../transform';
import { captureRef } from '../view/capture-ref';
import { Player } from './traits';

export function PlayerRenderer() {
  const players = useQuery(Player, Position);
  return players.map((entity) => <PlayerView key={entity.id()} entity={entity} />);
}

// A stand-in for the player, two units tall like a Minecraft character.
function PlayerView({ entity }: { entity: Entity }) {
  return (
    <mesh ref={captureRef(entity)} castShadow>
      <capsuleGeometry args={[0.3, 1.4, 4, 16]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}
