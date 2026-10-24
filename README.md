# PT Solusi Mitra Mandiri: Sistem All-In-One (AIO)

Situs publik dan portal admin untuk sistem manajemen gym **All-In-One (AIO)** yang
dikembangkan PT Solusi Mitra Mandiri. AIO adalah sebutan untuk arsitektur All-In-One
terpadu (bukan nama merek produk mandiri). Fitur dan ambang batasnya diturunkan dari basis
kode gym **FitDay** sebagai referensi implementasi.

Arsitektur saat ini terdiri dari dua proses:

| Lapisan | Teknologi | Peran |
| --- | --- | --- |
| API | Go 1.27 · chi · GORM · SQLite | Mesin data: menyimpan seluruh catatan, mengurus login, dan menyimpan berkas unggahan |
| Web | Next.js 16 · React 19 · TypeScript | Semua halaman yang dilihat pengunjung dan staf |

Server Go tidak merender HTML sama sekali; ia hanya menyajikan JSON dan berkas statis.
Next.js mem-proxy `/api/*`, `/uploads/*`, `/images/*`, dan `/videos/*` ke Go sehingga
browser selalu berjalan pada satu origin.

## Menjalankan

Butuh Go 1.27+ dan Node.js 24+.

Nilai konfigurasi yang dibutuhkan ada di [`.env.example`](.env.example) (server Go)
dan [`web/.env.example`](web/.env.example) (frontend). Server Go **tidak** membaca
berkas `.env` sendiri. Salin nilainya ke terminal atau manajer rahasia, lalu setel
sebelum menjalankan perintah di bawah.

```bash
# Terminal 1: API Go pada :8080
export SESSION_SECRET="$(openssl rand -base64 48)"
export ADMIN_PASSWORD="kata-sandi-pilihan-anda"
go run ./cmd/server

# Terminal 2: frontend Next.js pada :3000
cd web
npm install
npm run dev
```

Buka <http://localhost:3000>. Portal admin ada di <http://localhost:3000/admin/login>.

Untuk menjalankan versi produksi, bangun dulu frontend dengan `API_ORIGIN` yang
benar (lihat [Konfigurasi](#konfigurasi)), lalu jalankan `next start`:

```bash
cd web
API_ORIGIN=http://localhost:8080 npm run build
npx next start -p 3000
```

## Konfigurasi

Seluruh nilai berikut dibaca dari variabel lingkungan. Dua di antaranya tidak
punya nilai bawaan karena menentukan keamanan akses admin.

### Server Go

| Variabel | Bawaan | Keterangan |
| --- | --- | --- |
| `PORT` | `8080` | Port API |
| `DB_PATH` | `database.sqlite` | Berkas SQLite |
| `UPLOAD_DIR` | `uploads` | Direktori logo mitra |
| `SESSION_SECRET` | **wajib, tanpa bawaan** | Kunci penandatanganan cookie sesi |
| `ADMIN_EMAIL` | `admin@solusimitramandiri.com` | Akun admin yang dibuat otomatis |
| `ADMIN_PASSWORD` | **wajib untuk membuat akun admin, tanpa bawaan** | Kata sandi akun admin tersebut |
| `PUBLIC_SITE_URL` | `http://localhost:3000` | Tujuan pengalihan `/` |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Origin yang diizinkan CORS, dipisah koma |

Tanpa `SESSION_SECRET` server menolak start. Bangkitkan kuncinya sekali per
lingkungan dan simpan di manajer rahasia:

```bash
export SESSION_SECRET="$(openssl rand -base64 48)"
```

`ADMIN_PASSWORD` hanya dipakai saat akun `ADMIN_EMAIL` belum ada di basis data.
Bila variabel ini kosong, pembuatan akun admin dilewati dan server tetap jalan
tanpa akun admin. Untuk mengganti kata sandi admin yang sudah ada, ubah lewat
portal admin atau hapus barisnya dari tabel `users` lalu jalankan ulang server
dengan `ADMIN_PASSWORD` baru.

### Frontend Next.js

| Variabel | Bawaan | Dibaca saat | Keterangan |
| --- | --- | --- | --- |
| `API_ORIGIN` | `http://localhost:8080` | **build** | Alamat server Go yang di-proxy |
| `NEXT_PUBLIC_GA_ID` | `G-TFKE3G9D2K` | build | Properti GA4; isi kosong untuk mematikan pelacakan |

`API_ORIGIN` **harus** ditetapkan sebelum `npm run build`, dan hanya dibaca saat
build. Next membekukan tujuan pengalihan `/api` ke `.next/routes-manifest.json`,
dan permintaan yang dirender di server pun ikut melewati pengalihan yang sama.
Alamat yang salah tidak memunculkan galat: permintaan hanya dijawab `200` tanpa
isi, sehingga halaman tampak termuat tetapi tanpa data.

```bash
API_ORIGIN=http://localhost:8080 npm run build
```

## Endpoint API

| Metode | Jalur | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/api/health` | publik | Pemeriksaan status |
| `GET` | `/api/landing` | publik | Founder aktif dan mitra aktif |
| `POST` | `/api/demo-requests` | publik | Pengajuan demo dari formulir publik |
| `POST` | `/api/admin/login` | publik | Membuat sesi admin |
| `POST` | `/api/admin/logout` | publik | Mengakhiri sesi admin |
| `GET` | `/api/admin/me` | admin | Identitas admin dari sesi aktif |
| `GET` | `/api/admin/partners` | admin | Daftar mitra dan permintaan demo |
| `POST` | `/api/admin/partners` | admin | Unggah logo mitra (multipart) |
| `DELETE` | `/api/admin/partners/{id}` | admin | Hapus mitra beserta berkas logonya |

Kegagalan validasi menghasilkan `422` dengan bentuk:

```json
{ "error": "Masih ada kolom yang perlu diperbaiki.",
  "fields": { "email": "Penulisan email belum benar. Contoh yang benar: nama@perusahaan.com" } }
```

Berkas statis `/images` dan `/videos` dilayani dari `public/`, sedangkan `/uploads`
dari `UPLOAD_DIR`. Unggahan logo divalidasi berdasarkan isi berkas, bukan ekstensi
namanya, dan dibatasi 5 MB.

## Basis data

SQLite dibuat otomatis saat pertama dijalankan, termasuk skema dan data awal
(akun admin dan dua founder). Untuk memulai ulang dari nol, hapus `database.sqlite`
lalu jalankan ulang server.

## Struktur

```
cmd/server/         titik masuk server Go
internal/config/    pembacaan konfigurasi
internal/database/  koneksi basis data dan pengisian data awal
internal/handlers/  penangan permintaan HTTP
internal/middleware/ pemeriksaan akses admin
internal/models/    model basis data
public/             aset media yang dilayani Go (gambar, video)
uploads/            berkas unggahan pengguna
web/                aplikasi Next.js (app router)
web/app/design.css   sistem desain Ledger (lihat DESIGN.md)
web/lib/motion.ts    pendaftaran plugin GSAP, satu titik
web/components/motion/ pembungkus useGSAP: Reveal, RevealGroup, SplitHeadline
web/scripts/        skrip aset merek (dijalankan manual, butuh `sharp`)
```

## Deploy

Push ke `main` otomatis ter-deploy ke VPS. Tidak ada langkah tarik manual.

```
git push origin main
  └─ GitHub Actions (.github/workflows/deploy.yml)
       └─ SSH loyalfitness@202.10.38.50
            └─ scripts/deploy.sh
                 fetch origin/main → git reset --hard → go build bin/aio
                 → npm ci → next build (API_ORIGIN=http://127.0.0.1:8080)
                 → pm2 restart aio-api aio-web → health check
```

- Direktori aplikasi: `/home/loyalfitness/public_html/solusimitramandiri.com`.
  Apache me-reverse-proxy domain ke Next.js `:3005`, yang meneruskan `/api`,
  `/uploads`, `/images`, `/videos` ke Go `:8080`.
- Rahasia repositori yang dipakai workflow: `VPS_HOST`, `VPS_PORT`, `VPS_USER`,
  `VPS_SSH_KEY` (kunci privat ed25519; publiknya ada di
  `~loyalfitness/.ssh/authorized_keys`). Kunci ini hanya bisa login sebagai
  `loyalfitness`, bukan root.
- Deploy manual di VPS: `bash scripts/deploy.sh`.
- `database.sqlite`, `uploads/`, dan `.env` tidak tersentuh deploy karena
  masuk `.gitignore`; `git reset --hard` hanya mengembalikan berkas terlacak.
  Karena itu `.env` produksi (`/home/loyalfitness/.aio/api.env`) tetap manual.
- `API_ORIGIN` dibaca saat `next build`, bukan `next start`; mengubahnya di
  server tanpa rebuild tidak berpengaruh.

## SEO

- Metadata, canonical, Open Graph, Twitter card, dan robots diatur di
  `web/app/layout.tsx`; sumber tunggal nama, deskripsi, kontak, dan graf
  JSON-LD ada di `web/lib/seo.ts`.
- `/robots.txt` dan `/sitemap.xml` dibuat oleh Next (`app/robots.ts`,
  `app/sitemap.ts`), jadi daftar sitemap dan host selalu ikut. Portal admin
  dilarang lewat robots dan diberi `noindex` di `app/admin/layout.tsx`.
- Kartu pratinjau 1200x630 dirender dari kode di `app/opengraph-image.tsx`
  memakai dua font di `web/assets/fonts/` (dibaca dari disk, bukan diunduh
  saat build).
- Verifikasi Google Search Console memakai tag meta; tokennya ada di
  `GOOGLE_VERIFICATION` dan bisa ditimpa lewat env `GOOGLE_SITE_VERIFICATION`.
- Setiap deploy mengirim URL ke IndexNow (Bing, Yandex, Naver, Seznam) lewat
  `scripts/deploy.sh`, memakai berkas kunci di `web/public/<kunci>.txt`.
  Google tidak memakai IndexNow; untuk Google, sitemap dan permintaan
  pengindeksan di Search Console yang berlaku.

## Catatan

- Situs publik memakai sistem desain **Ledger**: kertas hangat, garis rambut, judul serif,
  angka mono sejajar, dan dua warna merek yang diambil dari logo (biru `#1b5cf0`,
  bara `#d93a1b`). Rinciannya di [DESIGN.md](DESIGN.md). Tema terang dan gelap
  dua-duanya berfungsi; pilihan disimpan di `localStorage`, dan tanpa pilihan
  sistem operasi yang menentukan.
- Bagian `#modul` menampilkan sembilan modul sebagai indeks bernomor dengan panel
  angka lengket di kiri pada layar lebar, bukan grid kartu seragam.
- Animasi memakai GSAP lewat pola React resminya: `useGSAP()` dengan `scope` untuk
  setiap komponen, `contextSafe()` untuk animasi yang dibuat setelah mount (klik,
  kirim formulir), dan `gsap.matchMedia()` untuk memisahkan jalur gerak-minimal.
  Semua tween ikut dibersihkan otomatis saat komponen dilepas. Gerak yang dipakai
  hanya tiga: baris judul naik dari topeng (SplitText), blok masuk saat masuk viewport
  (ScrollTrigger batch), dan indikator posisi (garis progres gulir + garis tab aktif).
- Formulir permintaan demo mengirim pengajuan ke `POST /api/demo-requests` sehingga tetap
  tercatat di portal admin, lalu memindahkan percakapan ke WhatsApp sales (nomornya di
  `WHATSAPP_NUMBER` di `web/lib/site.ts`). Isian formulir disalin apa adanya ke badan pesan;
  kalau tab baru diblokir, halaman yang sama yang berpindah ke WhatsApp.
- Aset merek di `public/images/brand/` dan ikon aplikasi (`web/app/icon.png`,
  `web/app/apple-icon.png`) dihasilkan dari `assets/solusimitramandiri-logo.png`
  oleh `web/scripts/brand-assets.mjs`, dijalankan manual dengan
  `node web/scripts/brand-assets.mjs`, hasilnya deterministik. Skrip memangkas
  margin transparan master, menyisakan 4% ruang napas, lalu mengemit hanya ukuran
  yang dipakai (96/192/384 px untuk header, footer, dan tampilan besar). Jalankan
  ulang bila logo master berubah.
- Hero tidak memakai video. Klip lama dan posternya adalah render bergaya neon yang
  tidak menunjukkan produk, jadi keduanya dihapus dari repo. Kalau nanti ada rekaman
  layar produk sungguhan, letakkan di `public/videos/` dan render lewat komponen klien.
- Avatar founder 216 px, yaitu tiga kali lipat kotak 72 px lama. Berkas PNG/JPG
  asli tetap ada di riwayat git bila sewaktu-waktu dibutuhkan.
- Logo mitra di `public/images/partners/` sudah dinormalkan: dipangkas ke batas
  kontennya, dipusatkan pada kanvas persegi 512 px, lalu dikodekan WebP (8–24 KB).
  Karena itu `.partner img` memakai `object-fit: contain` tanpa pemotongan.
  Master beresolusi penuh ada di `assets/`, bukan di `public/`, supaya tidak
  ikut ter-deploy.
  Lima mitra placeholder di-seed dari `internal/database/seeders.go` hanya saat
  tabel `gym_partners` kosong; setelah itu pengelolaannya lewat portal admin.
- `summarize.md` adalah dokumen warisan yang mendeskripsikan basis kode **FitDay**
  (Laravel 13 + Inertia + React 19), bukan aplikasi Go/Next.js di repositori ini.
  Bagian Tech Stack-nya karena itu akurat untuk subjeknya dan sengaja tidak diubah;
  yang dipertahankan adalah konteks bisnisnya (`Lead`, `User`, alur CRM, tanggung
  jawab modul PT/CS/POS). Lingkup ini juga dinyatakan di kepala berkas tersebut.
