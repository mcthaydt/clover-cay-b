import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import test from 'node:test';

test('failed draft test stops the suite before the next test starts', t => {
  const dir = mkdtempSync(join(tmpdir(), 'clover-draft-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const marker = join(dir, 'unexpected');
  const file = join(dir, 'case.test.mjs');
  writeFileSync(file, `
    import test from 'node:test';
    import { writeFileSync } from 'node:fs';
    test('first', () => { throw Error('expected failure'); });
    test('second', () => writeFileSync(${JSON.stringify(marker)}, 'ran'));
  `);
  const result = spawnSync(process.execPath, ['--import', './scripts/draft-bail.js', file], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stdout + result.stderr, /expected failure/);
  assert.equal(existsSync(marker), false);
});
