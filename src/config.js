'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Muat .env sederhana tanpa dependensi tambahan.
 * Variabel yang sudah ada di environment tidak ditimpa.
 */
function loadEnv() {
  const file = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(file)) return;

  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv();

function int(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = process.env[name];
  if (!raw || !/^\d+$/.test(raw.trim())) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) return fallback;
  return value;
}

const config = {
  baseUrl: (process.env.SIAKAD_BASE_URL || 'https://siakad.polinema.ac.id').replace(/\/+$/, ''),
  username: (process.env.SIAKAD_USERNAME || '').trim(),
  password: process.env.SIAKAD_PASSWORD || '',
  menuFilter: (process.env.SIAKAD_MENU_FILTER || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  maxMenus: int('SIAKAD_MAX_MENUS', 60, { min: 1, max: 500 }),
  navDelayMs: int('SIAKAD_NAV_DELAY_MS', 400, { min: 0, max: 10_000 }),
  testInvalidLogin: process.env.SIAKAD_TEST_INVALID_LOGIN === 'true',
};

config.hasCredentials = Boolean(config.username && config.password);

module.exports = config;
