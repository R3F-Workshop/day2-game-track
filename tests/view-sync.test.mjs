import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { createWorld } from 'koota';
import { Group, Mesh, Quaternion, Vector3 } from 'three/webgpu';
import { createServer } from 'vite';

await test('view sync in completed lessons', async (suite) => {
  // Load the lesson's TypeScript with the same module resolution as the app.
  const server = await createServer({
    configFile: false,
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false },
  });
  suite.after(() => server.close());

  for (const step of (await readdir(new URL('../src/steps/', import.meta.url))).sort().slice(2)) {
    const load = (file) => server.ssrLoadModule(`/src/steps/${step}/${file}.ts`);
    const { Position, Rotation } = await load('transform/traits');
    const { Ref } = await load('view/traits');
    const { captureRef } = await load('view/capture-ref');
    const { syncTransforms } = await load('view/systems');

    await suite.test(
      `${step}: mounted views follow live transforms and preserve child offsets`,
      (t) => {
        const world = createWorld();
        t.after(() => world.destroy());
        const entity = world.spawn(Position(new Vector3(2, 1, -3)));
        const group = new Group();
        const model = new Mesh();
        model.position.y = -1;
        group.add(model);

        // A headless entity needs no view trait.
        syncTransforms(world);
        assert.equal(entity.has(Ref), false);
        captureRef(entity)(group);
        syncTransforms(world);
        assert.deepEqual(group.position.toArray(), [2, 1, -3]);

        // Direct mutations do not emit trait notifications.
        entity.get(Position).set(4, 2, 5);
        if (Rotation)
          entity.add(Rotation(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 1)));
        syncTransforms(world);
        assert.deepEqual(group.position.toArray(), [4, 2, 5]);
        assert.deepEqual(entity.get(Position).toArray(), [4, 2, 5]);
        assert.equal(model.position.y, -1);
        if (Rotation) assert.ok(group.quaternion.equals(entity.get(Rotation)));

        // Position-only objects keep local rotations such as the ground's quarter turn.
        const ground = world.spawn(Position);
        const plane = new Mesh();
        plane.rotation.x = -Math.PI / 2;
        captureRef(ground)(plane);
        syncTransforms(world);
        assert.equal(plane.rotation.x, -Math.PI / 2);
      }
    );

    await suite.test(`${step}: replacing and unmounting a view releases only its own ref`, (t) => {
      const world = createWorld();
      t.after(() => world.destroy());
      const entity = world.spawn(Position);
      const oldView = new Group();
      const newView = new Group();
      const detachOld = captureRef(entity)(oldView);
      const detachNew = captureRef(entity)(newView);
      detachOld();
      assert.equal(entity.get(Ref), newView);

      entity.get(Position).x = 7;
      syncTransforms(world);
      assert.equal(newView.position.x, 7);
      assert.equal(oldView.position.x, 0);
      detachNew();
      assert.equal(entity.has(Ref), false);
      entity.get(Position).x = 9;
      syncTransforms(world);
      assert.equal(newView.position.x, 7);
    });

    await suite.test(`${step}: an entity can be destroyed before its view unmounts`, (t) => {
      const world = createWorld();
      t.after(() => world.destroy());
      const entity = world.spawn(Position);
      const detach = captureRef(entity)(new Group());
      entity.destroy();
      assert.doesNotThrow(detach);
      assert.equal(captureRef(entity)(new Group()), undefined);
      assert.doesNotThrow(() => syncTransforms(world));
    });
  }
});
