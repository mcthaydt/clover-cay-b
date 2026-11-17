import assert from 'node:assert/strict';
import test from 'node:test';
import { scopeFor } from '../scripts/ci-scope.js';

test('ordinary docs skip suites, while rules, lockfiles and ready code changes get full checks', () => {
  assert.equal(scopeFor(['readme.md'], 'pull_request', false).quality, false);
  for (const path of ['CLAUDE.md', '.claude/skills/review/SKILL.md', 'package-lock.json', 'vite.config.js']) assert.ok(scopeFor([path], 'pull_request', true).full);
  assert.ok(scopeFor(['ui.js'], 'pull_request', false).full);
  assert.ok(scopeFor([], 'push', true).browser);
});

test('draft code gets relevant tests and gameplay media', () => {
  const draft = scopeFor(['course.js'], 'pull_request', true);
  assert.ok(draft.quality && draft.course && draft.browser);
  assert.equal(draft.full, false);
  assert.equal(draft.metadata, false);
});
