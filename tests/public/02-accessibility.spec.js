'use strict';

const { test, expect } = require('../../src/fixtures');

test.describe('Halaman publik - Aksesibilitas & aset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
  });

  test('atribut bahasa dan judul halaman valid', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
    await expect(page).toHaveTitle(/\S+/);
  });

  test('setiap gambar memiliki atribut alt', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      await expect(images.nth(i)).toHaveAttribute('alt', /.*/);
    }
  });

  test('field form memiliki placeholder atau label', async ({ page }) => {
    for (const selector of ['#username', '#password']) {
      const field = page.locator(selector);
      const placeholder = await field.getAttribute('placeholder');
      const id = await field.getAttribute('id');
      const hasLabel = await page.locator(`label[for="${id}"]`).count();
      expect(Boolean(placeholder) || hasLabel > 0).toBeTruthy();
    }
  });

  test('navigasi keyboard dapat mencapai field dan tombol login', async ({ page }) => {
    await page.locator('#username').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();
  });

  test('tidak ada error JavaScript kritis saat halaman dimuat', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    expect(errors, `Error JS: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('halaman login tidak overflow horizontal di desktop', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
