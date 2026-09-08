import { createActions, type Entity } from 'koota';
import { Vector3 } from 'three';
import { BoxCollider, Velocity } from '../physics/traits';
import { Position } from '../transform';
import { Block, BlockDamage } from './traits';

export const blockActions = createActions((world) => {
  // Blocks fill unit cells: whole numbers on x and z, and halves on y so they sit on the ground.
  const spawnBlockAt = (position: Vector3) => {
    const snapped = new Vector3(
      Math.round(position.x),
      Math.round(position.y - 0.5) + 0.5,
      Math.round(position.z)
    );

    const isOccupied = world
      .query(Block, Position)
      .some((block) => block.get(Position)!.equals(snapped));
    if (isOccupied) return;

    // A block cannot appear inside anything that moves, like the player.
    const intersectsBody = world.query(Velocity, Position, BoxCollider).some((body) => {
      const bodyPosition = body.get(Position)!;
      const { size } = body.get(BoxCollider)!;

      return (
        Math.abs(bodyPosition.x - snapped.x) < (size.x + 1) / 2 &&
        Math.abs(bodyPosition.y - snapped.y) < (size.y + 1) / 2 &&
        Math.abs(bodyPosition.z - snapped.z) < (size.z + 1) / 2
      );
    });
    if (intersectsBody) return;

    return world.spawn(Block, BlockDamage, Position(snapped), BoxCollider);
  };

  return {
    spawnBlockAt,
    // Puts a block against the surface that was clicked, on the side that was hit.
    placeBlock: (surface: Entity, hit: { point: Vector3; normal: Vector3 }) => {
      const position = hit.point.clone();

      if (surface.has(Block)) {
        // Step one cell along whichever axis the face mostly points.
        const x = Math.abs(hit.normal.x);
        const y = Math.abs(hit.normal.y);
        const z = Math.abs(hit.normal.z);
        const offset = new Vector3();

        if (x >= y && x >= z) offset.x = Math.sign(hit.normal.x);
        else if (y >= z) offset.y = Math.sign(hit.normal.y);
        else offset.z = Math.sign(hit.normal.z);

        position.copy(surface.get(Position)!).add(offset);
      } else {
        // The ground is a floor, so the block goes half a unit up from where it was hit.
        position.y += 0.5;
      }

      return spawnBlockAt(position);
    },
  };
});
