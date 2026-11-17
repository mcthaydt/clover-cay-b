---
name: scene-polish
description: Use when an in-game scene is built and needs to look better, when a milestone has added scenes, or when a change touches gameplay (movement, controls, rules, camera).
---

# Scene polish

A scene is anything the player sees in play that is not a menu or the HUD. Menus and the HUD use `visual-check`.

## The loop, one scene at a time

1. Screenshot the scene as built, from the running game, on a fixed seed and an injected clock, once the scene reports ready.
2. Give that screenshot to GPT image generation with the words "reimagine this image", keeping the camera, the gameplay geometry and every interaction cue where they are. Commit the result as `docs/superpowers/scenes/<scene>.png`, beside the screenshot it came from (`<scene>-before.png`) and the exact prompt (`<scene>.md`). The image is the scene's art reference: a guide to its look, never a score. Regenerate it only for a scene change inside the scope the owner approved, or on the owner's words.
3. Fix the scene, capture it at the size and camera of the screenshot the image came from, and run the scene review (rounds and models in Settings): each capture next to the art reference. It lists the biggest gaps against the criteria in step 4.
4. A scene passes when each explicit criterion holds: visual hierarchy (the eye goes first to what the player must act on), readable interactions (every cue and target is clear at play speed), consistent art direction (colour, lighting, shapes and scale follow the reference's direction, not its pixels), motion (animation reads clearly, with no stutter) and performance (the frame-time budget in the brief holds on its named hardware). The gameplay geometry and camera still match the screenshot, text and the HUD stay legible, and nothing the player needs is hidden. Each try fixes the biggest gaps. At most the tries in Settings; after that, stop that approach and reassess (Limits in CLAUDE.md). On a public repo no session can measure that budget: a scene can pass its other criteria and take its golden, and the budget stays "not measured, awaiting the owner's measurement" in every report until the owner measures it by hand (see Where work runs in `release`) or writes a waiver beside it.
5. The passing screenshot becomes the scene's golden in `tests/golden/`. A golden moves later for a change inside the scope the owner approved (the brief or milestone that named the scene change), with its before and after in the pull request; any other move waits for the owner, and a golden never moves to hide a defect (see `release`).

Gameplay is judged separately, by the playtest below: a scene that looks right but plays badly fails there. The first scene goes through the whole loop alone and must pass before the rest start. The scenes after it run side by side, as the session limit allows.

## Playtest and controls check

- This check runs whenever a change touches gameplay (movement, controls, rules, camera), whether or not a scene changed. It checks the quality bar in `build`; its performance and supported-device criteria are agreed in the brief.
- Playwright tests in `tests/playtest/`, written with the game and run like every other test, wait on readiness and never on a sleep. On the device matrix in Settings, play from first open through the core loop and the outcomes defined in the brief. Test winning and losing in separate runs when those outcomes exist. For an endless or sandbox game, test its specified progression, state transitions and recovery without inventing a win or loss condition. Check restart, pause and save where supported, and exercise every supported control (keyboard, mouse, touch, gamepad). Check relevant interactions with audio muted to verify that essential feedback remains understandable.
- At the end of each milestone an independent reviewer (a fresh session) also plays a short exploratory play session off the scripted route and judges onboarding, challenge and control feel against the quality bar: the scripted route alone cannot show those.
- Nothing may be unreachable, stuck, or need explaining. Read the opening minute closely: is it clear, and where does a new player's attention or confidence drop? Read the video, screenshots and console errors.
- Its device runs are emulation evidence; the frame-time budget is measured on the hardware the brief names. The video and screenshots are taken automatically when the diff touches gameplay or scene files, with no label needed. A missing playtest, or a control it never uses, is a finding.

## Rounds and the owner's looks

Scene review runs the same slice end as design review (see "Slice end" in `staged-path`), and the scenes go on the screens page beside the screens: a fresh end-to-end walk; scene review round 1, then round 2, each on the model Settings names for it, with a fresh session checking every capture against its art reference one by one, never a sample; the screens page, for the owner's first look; round 3 on the owner's notes; the screens page again; the owner's own walk; and the retrospective. Each check uses the criteria in step 4, never pixel perfection, on each device in the matrix. Scenes the owner has already approved are skipped (see `visual-check`). The loop above is the fix while a scene is built, within the tries in Settings; these rounds are the check at the slice end, with the other visual checks.
