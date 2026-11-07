# SIAKAD QA Automation

Automated QA suite untuk **SIAKAD Politeknik Negeri Malang** (`https://siakad.polinema.ac.id`) menggunakan Playwright.

Suite ini **read-only**: hanya membuka halaman, mengisi form login, dan membaca tampilan. Tidak ada aksi yang mengubah data akademik (tidak submit KRS, tidak menghapus data, tidak mengubah profil).

## Cakupan pengujian

### 1. Halaman publik (`tests/public`) — bisa dijalankan tanpa kredensial

| File | Yang diuji |
| --- | --- |
| `01-login.spec.js` | Form login tampil, field bisa diisi, validasi username/password kosong, toggle "Tampilkan Password", tautan lupa password, modal reset password, login dengan kredensial salah (opsional) |
| `02-accessibility.spec.js` | `lang`, judul halaman, atribut `alt` gambar, label/placeholder field, navigasi keyboard, error JavaScript, overflow horizontal |
| `03-responsive.spec.js` | Tampilan login pada mobile (375px), tablet (768px), desktop (1440px) tanpa overflow |
| `04-links.spec.js` | Semua tautan internal halaman login merespons < 400, halaman recovery password dapat dibuka |

### 2. Fitur setelah login (`tests/auth`) — butuh kredensial

| File | Yang diuji |
| --- | --- |
| `01-login.spec.js` | Login berhasil, sesi bertahan setelah reload, menu sidebar terdeteksi, logout mengakhiri sesi |
| `02-all-features.spec.js` | Menelusuri **seluruh menu sidebar** satu per satu: HTTP status, halaman tidak kosong, tidak ada error PHP/SQL/404 |
| `03-feature-map.spec.js` | Memetakan fitur utama (KRS, KHS, transkrip, jadwal, presensi, keuangan, cuti, beasiswa, tugas akhir, evaluasi, wisuda, profil, pengumuman) ke menu yang tersedia dan membuka halamannya |

Hasil crawl dan peta fitur disimpan sebagai attachment JSON di laporan HTML.

## Instalasi

```bash
cd /home/ell/siakad-qa-automation
npm install
npx playwright install chromium
```

## Menjalankan

Hanya halaman publik (tanpa akun):

```bash
npm run test:public
```

Seluruh suite (halaman publik + fitur setelah login):

```bash
cp .env.example .env
# isi SIAKAD_USERNAME dan SIAKAD_PASSWORD
npm test
```

Mode melihat browser:

```bash
npm run test:headed
```

Membuka laporan HTML:

```bash
npm run report
```

## Konfigurasi (`.env`)

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `SIAKAD_BASE_URL` | `https://siakad.polinema.ac.id` | URL target |
| `SIAKAD_USERNAME` | – | NIM akun uji |
| `SIAKAD_PASSWORD` | – | Password akun uji |
| `SIAKAD_MENU_FILTER` | kosong | Batasi crawl ke menu tertentu, mis. `krs,khs,jadwal` |
| `SIAKAD_MAX_MENUS` | `60` | Maksimum menu yang dikunjungi |
| `SIAKAD_NAV_DELAY_MS` | `400` | Jeda antar navigasi agar server tidak terbebani |
| `SIAKAD_TEST_INVALID_LOGIN` | `false` | Set `true` untuk menguji login gagal |
| `HEADLESS` | `true` | Set `false` untuk melihat browser |

Tanpa `SIAKAD_USERNAME`/`SIAKAD_PASSWORD`, seluruh test di `tests/auth` otomatis **di-skip** dan dilaporkan sebagai skipped — bukan gagal, bukan lulus palsu.

## Catatan penting

- Gunakan **akun uji**, bukan akun pribadi dengan data sensitif. File `.env` sudah masuk `.gitignore`.
- Semua fitur akademik SIAKAD berada di balik login, sehingga pengujian fitur **tidak mungkin** dilakukan tanpa kredensial yang sah.
- Daftar menu dapat berbeda antar peran (mahasiswa, dosen, admin). Test `03-feature-map` melaporkan fitur yang tidak tersedia pada akun yang dipakai, bukan menganggapnya gagal.
- Jangan menaikkan jumlah worker atau menghapus jeda navigasi saat menguji server produksi kampus.

## Struktur

```
siakad-qa-automation/
├── playwright.config.js
├── src/
│   ├── config.js       # loader .env + konfigurasi
│   └── fixtures.js     # fixture app: login, menus, healthyPage
├── tests/
│   ├── public/         # pengujian tanpa login
│   └── auth/           # pengujian fitur setelah login
└── reports/            # hasil (json, html, screenshot kegagalan)
```
