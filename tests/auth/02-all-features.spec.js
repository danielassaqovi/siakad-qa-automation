'use strict';

const { test, expect, config } = require('../../src/fixtures');

/**
 * Menelusuri seluruh menu sidebar setelah login.
 * Setiap menu dianggap satu fitur dan diuji: HTTP status, render halaman,
 * serta tidak adanya error server/PHP/SQL.
 */
test.describe('Semua fitur - crawl menu', () => {
  test.skip(!config.hasCredentials, 'Isi SIAKAD_USERNAME dan SIAKAD_PASSWORD di .env untuk menjalankan test ini.');

  test('seluruh menu dapat dibuka tanpa error', async ({ page, app }) => {
    test.setTimeout(15 * 60_000);

    await app.login();
    const allMenus = await app.menus();

    const menus = allMenus
      .filter((menu) => {
        if (!config.menuFilter.length) return true;
        const haystack = `${menu.label} ${menu.url}`.toLowerCase();
        return config.menuFilter.some((keyword) => haystack.includes(keyword));
      })
      .slice(0, config.maxMenus);

    test.skip(menus.length === 0, 'Tidak ada menu yang cocok dengan filter.');

    const results = [];

    for (const [index, menu] of menus.entries()) {
      const response = await page.goto(menu.url, { waitUntil: 'domcontentloaded' }).catch((error) => {
        results.push({ ...menu, status: 'ERROR', note: error.message.split('\n')[0] });
        return null;
      });

      if (!response) continue;

      await page.waitForTimeout(config.navDelayMs);

      const body = await page.locator('body').innerText().catch(() => '');
      const serverError =
        /Fatal error|Parse error|Uncaught Exception/i.test(body) ||
        /A Database Error Occurred|Unable to connect to your database/i.test(body) ||
        /404 Page Not Found|Halaman tidak ditemukan/i.test(body) ||
        /Undefined (variable|index|property|offset)/i.test(body) ||
        /SQLSTATE\[|Access denied for user/i.test(body);

      const status = response ? response.status() : 0;
      const ok = status > 0 && status < 400 && !serverError && body.trim().length > 0;

      results.push({
        index: index + 1,
        label: menu.label,
        url: menu.url,
        status,
        serverError,
        ok,
      });

      expect.soft(status, `${menu.label}: HTTP ${status}`).toBeLessThan(400);
      expect.soft(serverError, `${menu.label}: halaman menampilkan error server`).toBeFalsy();
      expect.soft(body.trim().length, `${menu.label}: halaman kosong`).toBeGreaterThan(0);
    }

    await test.info().attach('hasil-crawl-menu.json', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });

    const failed = results.filter((item) => item.ok === false);
    const summary = [
      `Total menu diuji : ${results.length}`,
      `Berhasil         : ${results.length - failed.length}`,
      `Gagal            : ${failed.length}`,
      '',
      ...failed.map((item) => `- ${item.label} (${item.url}) status=${item.status}`),
    ].join('\n');

    // eslint-disable-next-line no-console
    console.log(`\n${summary}\n`);

    expect(failed, `Menu gagal:\n${summary}`).toHaveLength(0);
  });
});
