---
name: this-repo
description: Clover Cay B layout, local checks and GitHub merge gate.
---

The inherited browser game uses flat ES modules. The executable module order is in
`tests/architecture.test.ts`. Course geometry lives in `course.js`; `main.js`
starts Pixi and Rapier, handles input and runs the game loop. Vite builds the
single-page game into `dist/`. The inherited Sites project identifier points to A.
Use the GitHub remote for B's repository work.

Use Node 24 and run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`,
and `npm run build`. Install Chromium with `npx playwright install chromium`,
then run `npm run playtest`. A local system Chromium can be selected with
`CHROMIUM_PATH`. Playwright serves the production build and waits for a visible
game canvas and the loading screen to close.

The required aggregate check is `gate`. Ordinary Markdown-only PRs run scope
and commit-authors. Drafts run lint, typecheck, build and relevant tests. Gameplay and display changes
automatically capture browser media. Ready code PRs and changes to rules or build
configuration run the full suite and six browser shards. Each push to main runs full quality and browser
checks independently. The browser projects use Chromium at phone, tablet and
desktop viewport sizes. CI retains screenshots and videos for three days.
Use the serial integration procedure in the release skill for this personal repository. The coordinator tracks branch protection and hosted results.
