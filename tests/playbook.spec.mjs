import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const variants = ['dist'];
for (const variant of variants) for (const width of [1440, 390]) {
  test(`${variant}: offline checklist, export and recovery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    const external = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      if (route.request().url().startsWith('http://127.0.0.1:3196/')) return route.continue();
      external.push(route.request().url());
      return route.abort();
    });
    await page.goto(`/${variant}/index.html`);
    await page.getByRole('button', { name: 'Dismiss orientation' }).click();
    const action = page.locator('#chapters label button').first();
    const weekly = page.locator('#checklist label button').first();
    await action.click();
    await weekly.click();
    await page.reload();
    await expect(action).toHaveText('✓');
    await expect(weekly).toHaveText('✓');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    const download = await downloadPromise;
    expect(await readFile(await download.path(), 'utf8')).toContain('- [x]');
    await page.evaluate(() => localStorage.setItem('bash_playbook_progress_v1', 'invalid-json'));
    await page.reload();
    await expect(action).toHaveText('');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => document.querySelector('meta[name="viewport"]').content)).not.toContain('user-scalable=no');
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('blocked storage leaves the offline checklist usable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage is blocked'); } });
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/dist/index.html');
  const action = page.locator('#chapters label button').first();
  await action.click();
  await expect(action).toHaveText('✓');
  expect(errors).toEqual([]);
});
