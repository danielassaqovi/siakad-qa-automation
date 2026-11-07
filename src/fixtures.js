'use strict';

const playwright = require('@playwright/test');
const config = require('./config');

const expect = playwright.expect;

/**
 * Fixture `app`:
 * - app.login()       -> login memakai SIAKAD_USERNAME / SIAKAD_PASSWORD
 * - app.menus()       -> daftar menu sidebar yang bisa diklik
 * - app.healthyPage() -> assertion halaman tidak menampilkan error server
 */
const test = playwright.test.extend({
  app: async function ({ page }, use) {
    const app = {
      page: page,

      login: async function () {
        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.locator('#username').fill(config.username);
        await page.locator('#password').fill(config.password);
        await page.locator('#form_login button[type="submit"]').click();

        await page.waitForURL(/\/beranda/i, { timeout: 45_000 });
        await page.waitForLoadState('domcontentloaded');
      },

      menus: async function () {
        const selectors = [
          '.page-sidebar-menu a[href]',
          '.page-sidebar a[href]',
          '#sidebar a[href]',
          '.sidebar-menu a[href]',
          'aside a[href]',
        ];

        for (const selector of selectors) {
          const links = page.locator(selector);
          const count = await links.count();
          if (count > 0) {
            const items = [];
            const seen = new Set();
            for (let i = 0; i < count; i += 1) {
              const link = links.nth(i);
              if (!(await link.isVisible().catch(function () { return false; }))) continue;

              const href = await link.getAttribute('href');
              const label = ((await link.innerText().catch(function () { return ''; })) || '')
                .replace(/\s+/g, ' ')
                .trim();
              if (!href || !label) continue;
              if (/^(#|javascript:)/i.test(href)) continue;
              if (/logout|keluar|sign\s*out/i.test(label) || /logout/i.test(href)) continue;

              let url;
              try {
                url = new URL(href, page.url()).toString();
              } catch (error) {
                continue;
              }
              if (!url.startsWith(config.baseUrl)) continue;
              if (seen.has(url)) continue;

              seen.add(url);
              items.push({ label: label, url: url });
            }

            if (items.length) return items;
          }
        }

        return [];
      },

      healthyPage: async function () {
        const body = await page.locator('body').innerText().catch(function () { return ''; });
        expect(body, 'halaman tidak boleh kosong').not.toHaveLength(0);
        expect(body).not.toMatch(/Fatal error|Parse error|Uncaught Exception/i);
        expect(body).not.toMatch(/A Database Error Occurred|Unable to connect to your database/i);
        expect(body).not.toMatch(/404 Page Not Found|Halaman tidak ditemukan/i);
        expect(body).not.toMatch(/Undefined (variable|index|property|offset)/i);
        expect(body).not.toMatch(/Access denied for user|SQLSTATE\[/i);
      },
    };

    await use(app);
  },
});

module.exports = { test: test, expect: expect, config: config };
