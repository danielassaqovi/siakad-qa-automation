'use strict';

const { test, expect, config } = require('../../src/fixtures');

test.describe('Halaman publik - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
  });

  test('halaman login tampil lengkap', async ({ page, app }) => {
    await expect(page).toHaveTitle(/SIAKAD/i);
    await expect(page.locator('#form_login')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#form_login button[type="submit"]')).toBeVisible();
    await expect(page.locator('#alert-login')).toContainText(/Username dan Password/i);
    await app.healthyPage();
  });

  test('field username dan password dapat diisi', async ({ page }) => {
    await page.locator('#username').fill('1234567890');
    await page.locator('#password').fill('rahasia-uji');

    await expect(page.locator('#username')).toHaveValue('1234567890');
    await expect(page.locator('#password')).toHaveValue('rahasia-uji');
  });

  test('validasi username kosong muncul tanpa reload', async ({ page }) => {
    await page.locator('#password').fill('rahasia-uji');
    await page.locator('#form_login button[type="submit"]').click();

    await expect(page.locator('#alert-login')).toContainText(/Username harus diisi/i);
    await expect(page).toHaveURL(/\/login/i);
  });

  test('validasi password kosong muncul tanpa reload', async ({ page }) => {
    await page.locator('#username').fill('1234567890');
    await page.locator('#form_login button[type="submit"]').click();

    await expect(page.locator('#alert-login')).toContainText(/Password harus diisi/i);
    await expect(page).toHaveURL(/\/login/i);
  });

  test('checkbox "Tampilkan Password" membuka dan menutup password', async ({ page }) => {
    const password = page.locator('#password');
    const toggle = page.locator('#chk_tampilkan');

    await expect(password).toHaveAttribute('type', 'password');

    await toggle.check();
    await expect(password).toHaveAttribute('type', 'text');

    await toggle.uncheck();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('tautan "Lupa Password" menuju halaman pemulihan', async ({ page }) => {
    const link = page.locator('#forget-password');
    await expect(link).toHaveAttribute('href', /recovery_password/i);

    await link.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/recovery_password/i);
  });

  test('modal reset password dapat dibuka dan ditutup', async ({ page }) => {
    const modal = page.locator('#resetPassword');
    const nim = page.locator('#nimMsMhs');

    // Modal dibuka lewat jQuery; panggil API modal secara langsung agar stabil.
    await page.evaluate(() => window.jQuery('#resetPassword').modal('show'));
    await expect(modal).toBeVisible();
    await expect(nim).toBeVisible();

    await page.evaluate(() => window.jQuery('#resetPassword').modal('hide'));
    await expect(modal).toBeHidden();
  });

  test('login dengan kredensial salah menampilkan pesan error', async ({ page }) => {
    test.skip(!config.testInvalidLogin, 'Set SIAKAD_TEST_INVALID_LOGIN=true untuk menjalankan test ini.');

    await page.locator('#username').fill(`invalid_${Date.now()}`);
    await page.locator('#password').fill('password-salah-uji');
    await page.locator('#form_login button[type="submit"]').click();

    await expect(page.locator('#alert-login')).not.toContainText(/Sedang login/i, { timeout: 30_000 });
    await expect(page.locator('#alert-login')).toContainText(/.+/);
    await expect(page).toHaveURL(/\/login/i);
  });
});
