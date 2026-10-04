# GERAK

Website workout di rumah tanpa alat, dibuat dengan Astro. Satu halaman statis, tanpa backend, progres disimpan di `localStorage`.

```sh
npm install
npm run dev
```

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Build ke `dist/` |
| `npm run preview` | Preview hasil build |
| `npm run check` | Type check (`astro check`) |
| `npm test` | Unit test (`node --test tests/`) |
| `npm run og` | Regenerasi `public/og.png` dari `src/assets/og.svg` (butuh `rsvg-convert`) |

`npm test` memakai TypeScript type stripping bawaan Node, jadi butuh Node >= 22.18.

## Struktur

```
src/data/workouts.ts     # 6 program + 24 panduan gerakan (durasi diturunkan dari ronde x interval)
src/lib/progress.ts      # logika murni: weekKey, streak, progres, sanitasi/merge riwayat
src/lib/timer.ts         # logika murni: advance, isFinalSet, estimateMinutes, interval
src/lib/storage.ts       # pembungkus localStorage yang tidak pernah throw
src/pages/index.astro    # halaman + client script + CSS
src/pages/sitemap.xml.ts # route sitemap
src/pages/robots.txt.ts  # route robots
public/sw.js             # service worker (precache + network-first untuk navigasi)
public/manifest.webmanifest
src/assets/og.svg        # sumber kartu sosial 1200x630 (tidak dikirim ke dist)
tests/                   # node:test: data, progres, timer, dan simulasi sesi
```

`duration` pada tiap program tidak ditulis manual: nilainya dihitung `estimateMinutes(exercises.length, rounds, 30, 15)`, jadi angka di kartu selalu sama dengan timer. Ubah `rounds` untuk mengubah panjang sesi.

Data program di-embed ke halaman sebagai `<script type="application/json" id="gerak-data">`, lalu dibaca oleh client script yang di-bundle Astro.

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `22`

## Fitur

- Filter program berdasarkan level, durasi tiap kartu identik dengan timer
- Detail program + panduan per gerakan (target, langkah, napas, yang dihindari, modifikasi)
- Timer interval kerja/istirahat (20/10, 30/15, 40/20) dengan hitungan siap 3 detik, countdown suara, dan text-to-speech
- Pratinjau gerakan berikutnya saat istirahat, tanpa istirahat tambahan setelah set terakhir
- Toggle suara (persisten), screen wake lock, dan jeda otomatis saat tab tidak aktif
- Progres mingguan, streak harian, total menit, target mingguan, dan daftar 5 latihan terakhir
- Export dan import JSON, reset dengan konfirmasi, Web Share
- Lanjutkan program terakhir dari tombol latihan cepat
- Catatan keselamatan, metadata SEO (canonical, Open Graph, JSON-LD), dan PWA offline
- Mode gelap mengikuti `prefers-color-scheme` (`color-scheme` ikut diset agar kontrol form bawaan gelap), navigasi sticky
- Tulis `localStorage` dibungkus `src/lib/storage.ts`: mode privat atau kuota penuh tidak lagi menggagalkan sesi yang sudah selesai
