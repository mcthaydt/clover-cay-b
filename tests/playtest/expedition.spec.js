import { expect, test } from '@playwright/test';

test('explore the grove, return, recover, and celebrate at the flag', async ({ page, context }, info) => {
  // Drive the normal fixed-step simulation with a clock independent of GPU speed.
  await page.addInitScript(() => {
    globalThis.cloverClock = update => { globalThis.tick = frames => {
      for (let i = 0; i < frames; i++) update(1 / 60);
    }; };
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#loading')).toBeHidden();
  async function capture(name) {
    const path = info.outputPath(name + '.png');
    await page.locator('#scene').screenshot({ path });
    await info.attach(name, { path, contentType: 'image/png' });
  }
  const tick = count => page.evaluate(n => globalThis.tick(n), count);
  const state = () => page.evaluate(() => globalThis.cloverExpedition());
  const touch = info.project.name !== 'desktop';
  const cdp = touch && await context.newCDPSession(page);
  const keys = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', jump: 'Space', sprint: 'Shift' };
  const buttons = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', sprint: 'ShiftLeft' };
  const held = new Map();
  let pointerId = 0;
  async function press(control) {
    if (!touch) return page.keyboard.down(keys[control]);
    const b = await page.locator('[data-key="' + buttons[control] + '"]').boundingBox();
    expect(b).toBeTruthy();
    held.set(control, { x: b.x + b.width / 2, y: b.y + b.height / 2, id: ++pointerId });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [...held.values()] });
  }
  async function release(control) {
    if (!touch) return page.keyboard.up(keys[control]);
    held.delete(control);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [...held.values()] });
  }
  await page.locator('#sound').click();
  await tick(30);
  await capture('landing');
  await press('right'); await tick(79); await release('right'); await tick(15);
  expect((await state()).checkpoint).toBe('Waterfall Fork');
  await press('up'); await press('sprint'); await tick(7); await press('jump');
  await tick(36); await release('jump'); await release('up'); await release('sprint'); await tick(35);
  expect((await state()).stars).toBe(1);
  await capture('grove-star');
  await page.locator('#pause').click();
  const paused = await state();
  await tick(60);
  expect(await state()).toEqual(paused);
  await page.getByRole('button', { name: 'Resume' }).click();
  await press('right'); await press('sprint'); await tick(7); await press('jump'); await tick(34);
  await release('jump'); await release('sprint'); await release('right'); await tick(35);
  expect((await state()).stars).toBe(2);
  await press('down'); await press('sprint'); await press('jump'); await tick(42);
  await release('jump'); await release('sprint'); await release('down'); await tick(40);
  expect((await state()).location).toBe('Summit Ridge');
  await press('down'); await tick(85); await release('down'); await tick(20);
  expect((await state()).falls).toBe(1);
  expect((await state()).stars).toBe(2);
  await capture('recovery');
  await press('right'); await press('sprint'); await tick(42); await press('jump');
  await tick(30); await release('jump'); await release('right'); await release('sprint'); await tick(30);
  await expect(page.getByRole('heading', { name: 'Summit reached!' })).toBeVisible();
  await expect(page.locator('#dialogBody')).toContainText('2 of 3 stars');
  await capture('summit');
  await page.getByRole('button', { name: 'Play again' }).click();
  expect(await state()).toMatchObject({ mode: 'play', stars: 0, coins: 0, falls: 0, checkpoint: 'Meadow Landing' });
  await tick(30);
  if (!touch) Object.assign(keys, { left: 'a', right: 'd', up: 'w' });
  await press('right'); await tick(24); await release('right');
  await press('left'); await tick(8); await release('left'); await tick(14);
  await press('up'); await press('sprint'); await tick(7); await press('jump'); await tick(34);
  await release('jump'); await release('sprint'); await release('up'); await tick(35);
  expect(await state()).toMatchObject({ location: 'Blossom Isle', stars: 1, falls: 0 });
  expect(errors).toEqual([]);
});
