'use strict';

const { test, expect } = require('../../src/fixtures');

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

test.describe('Halaman publik - Responsif', () => {
  for (const viewport of VIEWPORTS) {
    test(`login tampil tanpa overflow di ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/login', { waitUntil: 'domcontentloaded' });

      await expect(page.locator('#form_login')).toBeVisible();
      await expect(page.locator('#username')).toBeVisible();
      await expect(page.locator('#form_login button[type="submit"]')).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `overflow horizontal ${overflow}px`).toBeLessThanOrEqual(2);
    });
  }
});
