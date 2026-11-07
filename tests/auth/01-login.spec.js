'use strict';

const { test, expect, config } = require('../../src/fixtures');

test.describe('Autentikasi', () => {
  test.skip(!config.hasCredentials, 'Isi SIAKAD_USERNAME dan SIAKAD_PASSWORD di .env untuk menjalankan test ini.');

  test('login berhasil dan beranda tampil', async ({ page, app }) => {
    await app.login();

    await expect(page).toHaveURL(/\/beranda/i);
    await expect(page.locator('body')).toContainText(/\S+/);
    await app.healthyPage();
  });

  test('sesi bertahan setelah reload', async ({ page, app }) => {
    await app.login();
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/beranda/i);
    await expect(page.locator('#username')).toHaveCount(0);
  });

  test('menu sidebar tersedia setelah login', async ({ page, app }) => {
    await app.login();
    const menus = await app.menus();

    expect(menus.length, 'menu sidebar tidak terdeteksi').toBeGreaterThan(0);
    await test.info().attach('menu-sidebar.json', {
      body: JSON.stringify(menus, null, 2),
      contentType: 'application/json',
    });
  });

  test('logout mengakhiri sesi', async ({ page, app }) => {
    await app.login();

    const logout = page
      .locator('a[href*="logout" i], a:has-text("Logout"), a:has-text("Keluar"), button:has-text("Logout")')
      .first();

    test.skip((await logout.count()) === 0, 'Tautan logout tidak ditemukan pada layout.');

    await logout.click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/login|logout/i);

    await page.goto('/beranda', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/login/i);
  });
});
