// Each targeted file runs in its own Node process. A failed case ends that file
// immediately; the CI shell then stops before launching the following file.
import { afterEach } from 'node:test';
import { writeSync } from 'node:fs';

afterEach(context => {
  if (context.passed === false) {
    writeSync(2, String(context.error?.stack ?? context.name) + '\n');
    process.exit(1);
  }
});
