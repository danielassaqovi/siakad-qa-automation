'use strict';

const { test, expect, config } = require('../../src/fixtures');

test.describe('Halaman publik - Tautan', () => {
  test('semua tautan internal di halaman login dapat diakses', async ({ page, request }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const hrefs = await page.locator('a[href]').evaluateAll((nodes) =>
      nodes
        .map((node) => node.getAttribute('href'))
        .filter((href) => href && !/^(#|javascript:|mailto:|tel:)/i.test(href))
    );

    const urls = [...new Set(hrefs.map((href) => new URL(href, config.baseUrl).toString()))]
      .filter((url) => url.startsWith(config.baseUrl));

    expect(urls.length).toBeGreaterThan(0);

    for (const url of urls) {
      const response = await request.get(url, { maxRedirects: 5, timeout: 30_000 });
      expect(response.status(), `${url} mengembalikan ${response.status()}`).toBeLessThan(400);
    }
  });

  test('halaman recovery password dapat dibuka', async ({ page, app }) => {
    await page.goto('/recovery_password', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/recovery_password/i);
    await app.healthyPage();
  });
});
