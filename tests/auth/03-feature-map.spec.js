'use strict';

const { test, expect, config } = require('../../src/fixtures');

/**
 * Peta fitur SIAKAD untuk peran mahasiswa.
 * Setiap fitur dicocokkan dengan label/URL menu, lalu halaman dibuka
 * dan diperiksa kesehatannya. Fitur yang tidak tersedia pada akun
 * (misalnya karena peran berbeda) dicatat, bukan dianggap gagal.
 */
const FEATURES = [
  { key: 'beranda', name: 'Beranda', patterns: [/beranda/i, /dashboard/i, /home/i] },
  { key: 'profil', name: 'Profil / Data Mahasiswa', patterns: [/profil/i, /biodata/i, /data\s*mahasiswa/i] },
  { key: 'krs', name: 'Kartu Rencana Studi (KRS)', patterns: [/krs/i, /rencana\s*studi/i] },
  { key: 'khs', name: 'Kartu Hasil Studi (KHS)', patterns: [/khs/i, /hasil\s*studi/i, /nilai/i] },
  { key: 'transkrip', name: 'Transkrip Nilai', patterns: [/transkrip/i] },
  { key: 'jadwal', name: 'Jadwal Kuliah', patterns: [/jadwal/i, /schedule/i] },
  { key: 'presensi', name: 'Presensi / Kehadiran', patterns: [/presensi/i, /kehadiran/i, /absensi/i] },
  { key: 'keuangan', name: 'Pembayaran / Keuangan', patterns: [/keuangan/i, /pembayaran/i, /tagihan/i, /ukt/i] },
  { key: 'pengumuman', name: 'Pengumuman', patterns: [/pengumuman/i, /informasi/i, /berita/i] },
  { key: 'cuti', name: 'Cuti Akademik', patterns: [/cuti/i] },
  { key: 'beasiswa', name: 'Beasiswa', patterns: [/beasiswa/i] },
  { key: 'tugas-akhir', name: 'Tugas Akhir / Skripsi', patterns: [/tugas\s*akhir/i, /skripsi/i, /ta\b/i] },
  { key: 'evaluasi', name: 'Evaluasi Dosen', patterns: [/evaluasi/i, /kuisioner/i, /kuesioner/i] },
  { key: 'wisuda', name: 'Wisuda / Kelulusan', patterns: [/wisuda/i, /kelulusan/i, /yudisium/i] },
];

test.describe('Semua fitur - peta fitur SIAKAD', () => {
  test.skip(!config.hasCredentials, 'Isi SIAKAD_USERNAME dan SIAKAD_PASSWORD di .env untuk menjalankan test ini.');

  test('fitur utama tersedia dan dapat dibuka', async ({ page, app }) => {
    test.setTimeout(10 * 60_000);

    await app.login();
    const menus = await app.menus();

    const coverage = [];

    for (const feature of FEATURES) {
      const match = menus.find((menu) =>
        feature.patterns.some((pattern) => pattern.test(menu.label) || pattern.test(menu.url))
      );

      if (!match) {
        coverage.push({ fitur: feature.name, status: 'TIDAK DITEMUKAN', menu: null });
        continue;
      }

      const response = await page.goto(match.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(config.navDelayMs);

      const body = await page.locator('body').innerText().catch(() => '');
      const healthy =
        response &&
        response.status() < 400 &&
        !/Fatal error|A Database Error Occurred|404 Page Not Found|SQLSTATE\[/i.test(body);

      coverage.push({
        fitur: feature.name,
        status: healthy ? 'OK' : 'GAGAL',
        menu: match.label,
        url: match.url,
        http: response ? response.status() : 0,
      });

      expect.soft(healthy, `${feature.name} (${match.label}) gagal dimuat`).toBeTruthy();
    }

    await test.info().attach('peta-fitur.json', {
      body: JSON.stringify(coverage, null, 2),
      contentType: 'application/json',
    });

    const found = coverage.filter((item) => item.status !== 'TIDAK DITEMUKAN');
    const failed = coverage.filter((item) => item.status === 'GAGAL');

    // eslint-disable-next-line no-console
    console.log(
      [
        '',
        'Peta fitur SIAKAD',
        '-----------------',
        ...coverage.map(
          (item) => `${item.status.padEnd(15)} ${item.fitur}${item.menu ? ` -> ${item.menu}` : ''}`
        ),
        '',
      ].join('\n')
    );

    expect(failed, 'Ada fitur yang gagal dimuat').toHaveLength(0);
    expect(found.length, 'Tidak ada fitur utama yang terdeteksi pada menu').toBeGreaterThan(0);
  });
});
