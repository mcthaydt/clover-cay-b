import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validBody, validCommit } from './pr-metadata.js';

const { pull_request: pr } = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
if (!validBody(pr.body)) throw Error('Correct the PR attribution and final owner footer.');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const commits = git('rev-list', pr.base.sha + '..' + pr.head.sha).trim().split('\n');
for (const sha of commits) {
  const [name, email, committerName, committerEmail, message] =
    git('show', '-s', '--format=%an%x00%ae%x00%cn%x00%ce%x00%B', sha).split('\0');
  if (!validCommit({ author: { name, email }, committer: { name: committerName, email: committerEmail }, message })) {
    throw Error('Correct the commit identity or attribution on ' + sha);
  }
}
