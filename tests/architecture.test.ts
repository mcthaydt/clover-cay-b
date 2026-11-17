import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

// The inherited flat layout is small enough to specify every module in dependency order.
const layers = ['course.js', 'assets.js', 'sky.js', 'ui.js', 'scenery.js', 'main.js'];
test('each game module imports only modules below it', () => {
  const modules = readdirSync('.').filter(name => name.endsWith('.js') && !name.endsWith('.config.js'));
  assert.deepEqual(modules.sort(), [...layers].sort());
  for (const [index, name] of layers.entries()) {
    const source = ts.preProcessFile(readFileSync(name, 'utf8'), true, true);
    for (const { fileName } of source.importedFiles.filter(item => item.fileName.startsWith('.'))) {
      assert.ok(layers.slice(0, index).includes(basename(fileName)), name + ' imports ' + fileName);
    }
  }
});
