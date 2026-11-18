import assert from 'node:assert/strict';
import test from 'node:test';
import { bridge, coins, goal, groundAt, spawn, stars } from '../course.js';

test('the player starts above land and the summit flag stands on its platform', () => {
  assert.ok(groundAt(spawn[0], spawn[2]) > -20);
  assert.ok(spawn[1] > groundAt(spawn[0], spawn[2]));
  assert.equal(groundAt(goal[0], goal[2]), goal[1]);
});

test('the bridge is solid and the open ocean is below the fall threshold', () => {
  assert.equal(groundAt(bridge[0], bridge[1]), bridge[2]);
  assert.ok(groundAt(100, 100) < -6);
});

test('every collectible is above a platform', () => {
  assert.equal(stars.length, 3);
  assert.ok(coins.length > 0);
  for (const [x, y, z] of [...stars, ...coins]) {
    const ground = groundAt(x, z);
    assert.ok(ground > -20 && ground < y, 'unsupported collectible at ' + [x, y, z]);
  }
});

test('the fork leads north to the grove and east to the summit', () => {
  assert.equal(groundAt(0, 1), 0);
  assert.equal(groundAt(0, -3.4), .2);
  assert.deepEqual(goal, [5.8, 0, 1]);
  assert.ok(Math.abs(stars[0][0]) < .5 && stars[0][2] < -3);
});
