export function validBody(body) {
  const lines = (body ?? '').trimEnd().split(/\r?\n/);
  return lines.at(-1) === 'Requested by **mcthaydt**' && !lines.some(line => /^\s*(?:🤖\s*)?generated (by|with)\b/i.test(line));
}

export function validCommit({ author, committer, message }) {
  return [author, committer].every(identity =>
    identity?.name === 'Dawson McThay WGU' && identity.email === 'dmctha2@wgu.edu'
  ) && !/^\s*(?:co-authored-by:.*claude|claude-session:|(?:🤖\s*)?generated with claude code)/im.test(message);
}
