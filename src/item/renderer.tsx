import { Clone, Hud, PerspectiveCamera, useGLTF } from '@react-three/drei/webgpu';
import { useFrame } from '@react-three/fiber/webgpu';
import type { Entity } from 'koota';
import { useQueryFirst, useTrait } from 'koota/react';
import { useRef } from 'react';
import { type Group, MathUtils, Quaternion, Vector3 } from 'three/webgpu';
import hammerUrl from '../assets/hammer.glb?url';
import { FirstPersonBlock, ThirdPersonBlock } from '../block/renderer';
import { Camera, Follows, IsFirstPerson } from '../camera/traits';
import { IsGrounded, Velocity } from '../physics/traits';
import { Player } from '../character/player/traits';
import { HeldBy, Item, type ItemKind, ToolSwing } from './traits';

export type ItemDisplay = 'firstPerson' | 'thirdPerson';

const DEG = MathUtils.DEG2RAD;

type Display = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

// Minecraft's `firstperson_righthand` displays: a handheld item lies along the hand, a block sits
// in it corner-first.
const FIRST_PERSON_DISPLAY: Record<ItemKind, Display> = {
  hammer: {
    position: [1.13 / 16, 3.2 / 16, 1.13 / 16],
    rotation: [0, -90 * DEG, 25 * DEG],
    scale: 0.68,
  },
  block: { position: [0, 0, 0], rotation: [0, 45 * DEG, 0], scale: 0.4 },
};

// Picks the model for an item's kind, posed for the view it is shown in.
export function ItemView({ item, display }: { item: Entity; display: ItemDisplay }) {
  const kind = useTrait(item, Item)?.kind;
  if (!kind) return null;

  if (display === 'firstPerson') {
    return (
      <group {...FIRST_PERSON_DISPLAY[kind]}>
        <FirstPersonItem kind={kind} />
      </group>
    );
  }

  return <ThirdPersonItem kind={kind} />;
}

function FirstPersonItem({ kind }: { kind: ItemKind }) {
  switch (kind) {
    case 'hammer':
      return <FirstPersonHammer />;
    case 'block':
      return <FirstPersonBlock />;
  }
}

function ThirdPersonItem({ kind }: { kind: ItemKind }) {
  switch (kind) {
    case 'hammer':
      return <ThirdPersonHammer />;
    case 'block':
      return <ThirdPersonBlock />;
  }
}

// Renders the held item the way Minecraft does: in a second pass on top of the world with its
// own fixed 70° camera, so it never clips into blocks and keeps the same size at any world FOV.
export function FirstPersonView() {
  const camera = useQueryFirst(Camera, IsFirstPerson, Follows('*'));
  const player = camera?.targetFor(Follows);

  if (!player?.has(Player)) return null;

  return (
    <Hud>
      <PerspectiveCamera makeDefault fov={70} near={0.05} far={10} />
      <ambientLight intensity={0.4 * Math.PI} />
      {/* Minecraft's two level diffuse lights. */}
      <directionalLight intensity={0.45 * Math.PI} position={[0.2, 1, -0.7]} />
      <directionalLight intensity={0.45 * Math.PI} position={[-0.2, 1, 0.7]} />
      <HeldItem entity={player} />
    </Hud>
  );
}

const TICKS_PER_SECOND = 20;

const yAxis = new Vector3(0, 1, 0);
const zAxis = new Vector3(0, 0, 1);
const xAxis = new Vector3(1, 0, 0);
const q1 = new Quaternion();
const q2 = new Quaternion();

function HeldItem({ entity }: { entity: Entity }) {
  const bob = useRef<Group>(null);
  const arm = useRef<Group>(null);
  // Minecraft's `walkDist` and `bob`, tracked per second instead of per tick.
  const walk = useRef({ distance: 0, amount: 0 });
  // Minecraft's `mainHandHeight`: the item rises into view over a few ticks when equipped.
  const equip = useRef(0);
  const heldItem = useQueryFirst(Item, HeldBy(entity));

  useFrame((_, delta) => {
    if (!bob.current || !arm.current) return;

    // View bobbing follows the player's stride.
    const velocity = entity.get(Velocity);
    const speed = velocity ? Math.hypot(velocity.x, velocity.z) : 0;
    const targetAmount = entity.has(IsGrounded) ? Math.min(speed / TICKS_PER_SECOND, 0.1) : 0;
    walk.current.amount += (targetAmount - walk.current.amount) * (1 - Math.exp(-delta * 10));
    walk.current.distance += speed * delta * 0.6;

    const stride = -walk.current.distance * Math.PI;
    const amount = walk.current.amount;
    bob.current.position.set(
      Math.sin(stride) * amount * 0.5,
      -Math.abs(Math.cos(stride) * amount),
      0
    );
    bob.current.rotation.set(
      Math.abs(Math.cos(stride - 0.2) * amount) * 5 * DEG,
      0,
      Math.sin(stride) * amount * 3 * DEG,
      'ZXY'
    );

    equip.current = Math.min(1, equip.current + delta * 0.4 * TICKS_PER_SECOND);

    // Attack swing, straight from Minecraft's ItemInHandRenderer.
    const swing = entity.get(ToolSwing);
    const progress = swing ? Math.min(swing.elapsed / swing.duration, 1) : 0;
    const sqrtProgress = Math.sqrt(progress);
    const f = Math.sin(progress * progress * Math.PI);
    const f1 = Math.sin(sqrtProgress * Math.PI);

    arm.current.position.set(
      0.56 - 0.4 * f1,
      -0.52 - 0.6 * (1 - equip.current) + 0.2 * Math.sin(sqrtProgress * Math.PI * 2),
      -0.72 - 0.2 * Math.sin(progress * Math.PI)
    );
    arm.current.quaternion
      .setFromAxisAngle(yAxis, (45 - f * 20) * DEG)
      .multiply(q1.setFromAxisAngle(zAxis, f1 * -20 * DEG))
      .multiply(q2.setFromAxisAngle(xAxis, f1 * -80 * DEG))
      .multiply(q1.setFromAxisAngle(yAxis, -45 * DEG));
  });

  return (
    <group ref={bob}>
      <group ref={arm}>{heldItem && <ItemView item={heldItem} display="firstPerson" />}</group>
    </group>
  );
}

// Adapted from Minecraft Diamond Axe by Blender3D, licensed CC BY 4.0
// https://sketchfab.com/models/0d62f4d3676545c88ec8523213c055dd

// Hangs from the third-person character's right arm joint.
export function ThirdPersonHammer() {
  return (
    <group position={[0, -0.66, -0.04]} rotation={[-2.35, 0, -0.2]} scale={1.25}>
      <group rotation={[0, Math.PI / 1.8, -0.3]} scale={0.5}>
        <Hammer />
      </group>
    </group>
  );
}

// Fits the hammer into Minecraft's item space, a unit cube centered on the origin where a
// handheld sprite would lie in the XY plane. The hammer runs along the sprite's bottom-left to
// top-right diagonal, the way a pickaxe does, so Minecraft's hand transforms hold it correctly.
export function FirstPersonHammer() {
  return (
    <group position={[-0.37, -0.37, 0]} rotation={[0, 0, -Math.PI / 4]} scale={1.3}>
      <Hammer />
    </group>
  );
}

function Hammer() {
  const { scene } = useGLTF(hammerUrl);
  return <Clone object={scene} castShadow />;
}

useGLTF.preload(hammerUrl);
