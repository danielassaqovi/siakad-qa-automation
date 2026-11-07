'use strict';

const path = require('path');
const { defineConfig } = require('@playwright/test');

const BASE_URL = process.env.SIAKAD_BASE_URL || 'https://siakad.polinema.ac.id';
const HEADLESS = process.env.HEADLESS !== 'false';

const chromiumLaunchOptions = {
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
};

module.exports = defineConfig({
  testDir: path.join(__dirname, 'tests'),
  outputDir: path.join(__dirname, 'reports', 'test-results'),

  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),

  reporter: [
    ['list'],
    ['json', { outputFile: path.join(__dirname, 'reports', 'results.json') }],
    ['html', { outputFolder: path.join(__dirname, 'reports', 'html'), open: 'never' }],
  ],

  use: {
    baseURL: BASE_URL,
    headless: HEADLESS,
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    acceptDownloads: false,
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', launchOptions: chromiumLaunchOptions },
    },
  ],

  metadata: {
    tool: 'SIAKAD QA Automation',
    targetUrl: BASE_URL,
    readOnly: true,
  },
});
