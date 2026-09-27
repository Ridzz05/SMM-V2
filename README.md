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
berkas `.env` sendiri — salin nilainya ke terminal atau manajer rahasia, lalu setel
sebelum menjalankan perintah di bawah.

```bash
# Terminal 1 — API Go pada :8080
export SESSION_SECRET="$(openssl rand -base64 48)"
export ADMIN_PASSWORD="kata-sandi-pilihan-anda"
go run ./cmd/server

# Terminal 2 — frontend Next.js pada :3000
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
web/app/atelier.css sistem desain aio-flat-minimal (lihat DESIGN.md)
web/scripts/        skrip aset merek (dijalankan manual, butuh `sharp`)
```

## Catatan

- Situs publik menyajikan sistem manajemen gym **All-In-One (AIO)** PT Solusi Mitra Mandiri
  dengan tata letak minimalis dua dimensi: kanvas putih, hierarki monokrom, dan tanpa efek 3D.
  Satu-satunya warna adalah warna status semantik, dan warna itu tidak pernah menjadi
  satu-satunya penanda makna. Rinciannya di [DESIGN.md](DESIGN.md).
  Seluruh ornamen dekoratif kecerdasan buatan seperti blueprint grid, radial orbs, side-rails,
  dan sticky card stack telah dirombak menjadi struktur grid responsif yang teratur.
- Bagian `#domain` menampilkan sembilan modul domain dalam grid 3 kolom yang responsif,
  memudahkan pemindaian tanpa jebakan gulir lengket.
- Formulir permintaan demo mengirim pengajuan ke `POST /api/demo-requests` sehingga tetap
  tercatat di portal admin, lalu memindahkan percakapan ke WhatsApp sales (nomornya di
  `WHATSAPP_NUMBER` di `web/lib/site.ts`). Isian formulir disalin apa adanya ke badan pesan;
  kalau tab baru diblokir, halaman yang sama yang berpindah ke WhatsApp.
- Aset merek di `public/images/brand/` dan ikon aplikasi (`web/app/icon.png`,
  `web/app/apple-icon.png`) dihasilkan dari `assets/solusimitramandiri-logo.png`
  oleh `web/scripts/brand-assets.mjs` — dijalankan manual dengan
  `node web/scripts/brand-assets.mjs`, hasilnya deterministik. Skrip memangkas
  margin transparan master, menyisakan 4% ruang napas, lalu mengemit hanya ukuran
  yang dipakai (96/192/384 px untuk header, footer, dan tampilan besar). Jalankan
  ulang bila logo master berubah.
- Aset media dikompresi ke WebP: poster hero (`ai-gym-hero.webp`) dan avatar
  founder 216 px, yaitu tiga kali lipat kotak 72 px di `.founder-portrait`.
  Berkas PNG/JPG asli tetap ada di riwayat git bila sewaktu-waktu dibutuhkan.
- Media hero memakai rasio **16:9** (`.hero-art`), sama dengan film
  `public/videos/IMG_3125.mp4` (1280x720). Poster adalah potongan 16:9 yang
  ditambatkan ke bawah dari citra persegi aslinya agar subjek dan alas mesin
  latihan tetap utuh. Mengubah kontainer ke rasio potret akan memotong sekitar
  55% lebar frame film.
- Logo mitra di `public/images/partners/` sudah dinormalkan: dipangkas ke batas
  kontennya, dipusatkan pada kanvas persegi 512 px, lalu dikodekan WebP (8–24 KB).
  Karena itu `.partner-plate img` memakai `object-fit: cover` tanpa pemotongan.
  Master beresolusi penuh ada di `assets/`, bukan di `public/`, supaya tidak
  ikut ter-deploy.
  Lima mitra placeholder di-seed dari `internal/database/seeders.go` hanya saat
  tabel `gym_partners` kosong; setelah itu pengelolaannya lewat portal admin.
- `summarize.md` adalah dokumen warisan yang mendeskripsikan basis kode **FitDay**
  (Laravel 13 + Inertia + React 19), bukan aplikasi Go/Next.js di repositori ini.
  Bagian Tech Stack-nya karena itu akurat untuk subjeknya dan sengaja tidak diubah;
  yang dipertahankan adalah konteks bisnisnya (`Lead`, `User`, alur CRM, tanggung
  jawab modul PT/CS/POS). Lingkup ini juga dinyatakan di kepala berkas tersebut.
