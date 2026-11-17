export function scopeFor(paths, event, draft) {
  const rules = path => path === 'CLAUDE.md' || path.startsWith('.claude/') || path.startsWith('.github/');
  if (event !== 'pull_request') return { quality: true, full: true, browser: true, course: true, metadata: true };
  const quality = paths.some(path => rules(path) || !path.endsWith('.md'));
  const config = paths.some(path => rules(path) || /(^|\/)(package(-lock)?\.json|.*config\.[^/]+)$|(^|\/)(fixtures|database)\//.test(path) || path.startsWith('scripts/'));
  const full = quality && (!draft || config);
  const browser = full || paths.some(path => /^(?:[^/]+\.(?:js|css|html|ttf)|tests\/playtest\/.*|src\/.*|public\/.*|assets\/.*)$/.test(path));
  return { quality, full, browser, course: paths.includes('course.js') || paths.includes('tests/course.test.js'), metadata: paths.includes('tests/metadata.test.js') };
}
