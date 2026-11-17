import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#render canvas')).toBeVisible();
  await expect(page.locator('#loading')).toBeHidden();
});

test('pause and resume', async ({ page }) => {
  await page.getByRole('button', { name: 'Pause game' }).click();
  await expect(page.getByText('Taking a breather')).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.locator('#overlay')).toBeHidden();
});

test('open the field guide and return to the course', async ({ page }) => {
  await page.getByRole('button', { name: 'Field guide' }).click();
  await expect(page.getByText('Three stars lie off the main trail.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to course' }).click();
  await expect(page.locator('#overlay')).toBeHidden();
});
