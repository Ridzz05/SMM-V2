---
version: 3.0.0
name: ledger
category: 'Editorial Ledger: warm paper, serif voice, monospaced figures'
description: 'Sistem operasional gym dibaca seperti buku besar: kertas hangat, garis rambut, judul serif sebagai suara dokumen, angka mono yang sejajar ke bawah. Dua warna merek diambil dari logo, sisanya netral. Dibuat untuk PT Solusi Mitra Mandiri.'

dials:
  energy: 2
  rhythm: 3
  motion: 2
---

# Ledger

## Design Read

Landing dan portal admin untuk pemilik gym dan staf operasional di Indonesia, dengan
bahasa visual buku besar editorial (kertas hangat, serif, garis rambut, angka mono),
dial ENERGY 2 / RHYTHM 3 / MOTION 2.

## Kenapa arah ini

Produk ini menjual pencatatan yang rapi: uang masuk, sesi latihan yang benar-benar
terjadi, tanda tangan yang tersimpan. Arah desainnya karena itu diambil dari benda
yang memang dipakai untuk itu: buku besar. Setiap keputusan di bawah bisa dijelaskan
dalam satu baris.

| Keputusan | Alasan satu baris |
| --- | --- |
| Kertas hangat `#f6f4ef`, bukan putih murni | Mengurangi silau di layar meja depan gym dan memisahkan panel dari kanvas tanpa bayangan. |
| Judul serif (Instrument Serif) | Suara dokumen resmi: perjanjian, laporan, kop surat. Ini identitas, bukan tren. |
| Angka mono (IBM Plex Mono) dengan `tabular-nums` | Angka uang dan tanggal harus sejajar ke bawah supaya bisa dibandingkan sekilas. |
| Biru `#1b5cf0` dan bara `#c73312` dari logo | Dua warna ini milik merek; tidak ada warna ketiga yang diperkenalkan. |
| Garis rambut 1px, bukan kartu berbayang | Buku besar dipisahkan garis, bukan tumpukan kertas melayang. Bayangan hanya untuk toast. |
| Radius 2px / 6px | Sudut hampir tegak membaca "dokumen", bukan "aplikasi konsumen". |
| Indeks modul bernomor dengan panel lengket | Sembilan modul lebih mudah dipindai sebagai daftar bernomor daripada sembilan kartu seragam. |
| Pita gelap untuk seksi aturan | Satu seksi inversi menandai "ini aturan, bukan fitur", tanpa mengulang komposisi seksi lain. |

## Token

```css
--paper: #f6f4ef;      --paper-raised: #fbfaf7;  --paper-sunken: #eeebe4;
--ink: #17181b;        --ink-soft: #45474d;      --ink-faint: #63656d;
--rule: #d9d4c9;       --rule-strong: #b8b2a4;
--brand-blue: #1b5cf0; --brand-ember: #c73312;
--ok: #1b6b45;         --warn: #8a5a00;          --danger: #b3261e;
```

Tema gelap menukar kelima permukaan dan tiga warna teks; biru dan bara diterangkan
(`#6f96ff`, `#ff6a45`) supaya tetap ≥ 4.5:1 di atas `#121316`. Status selalu
membawa label teks, jadi warna tidak pernah jadi satu-satunya penanda.

## Tipografi

| Peran | Keluarga | Ukuran |
| --- | --- | --- |
| Judul halaman | Instrument Serif 400 | `clamp(2.5rem, 5.6vw, 4.5rem)` |
| Judul seksi | Instrument Serif 400 | `clamp(1.625rem, 2.6vw, 2.125rem)` |
| Teks isi | Inter 400 | 15px, `line-height 1.62` |
| Label, angka, tanggal | IBM Plex Mono 400/500 | 10–13px, `letter-spacing .1em` untuk label kapital |

Label mono kapital dipakai hanya untuk metadata (eyebrow, kolom tabel, satuan angka),
bukan untuk judul. Judul tidak pernah memakai huruf kapital bertracking lebar.

## Gerak (GSAP, pola React)

Semua animasi lewat `useGSAP()` dari `@gsap/react`, dengan `scope` per komponen dan
`gsap.matchMedia()` untuk memisahkan jalur gerak-minimal. Animasi yang dibuat setelah
mount (klik, kirim formulir) dibungkus `contextSafe()`.

| Gerak | Alat | Alasan |
| --- | --- | --- |
| Baris judul naik dari topeng | SplitText `mask: 'lines'` | Menandai judul sebagai titik fokus layar; hanya judul yang bergerak besar. |
| Blok masuk saat masuk viewport | ScrollTrigger `batch`, sekali | Menandai konten baru mulai, lalu berhenti. Tidak ada loop. |
| Garis progres di bawah bar | ScrollTrigger `scrub` | Pengguna tahu posisinya di halaman panjang. |
| Garis bawah tautan aktif | ScrollTrigger `onToggle` | Orientasi: seksi mana yang sedang dibaca. |
| Indikator tab admin | `gsap.to` di `contextSafe` | Tab aktif harus terlihat jelas; gerak menjelaskan perpindahan. |
| Getar field yang ditolak | `elastic.out` 0.42s | Satu-satunya gerak di formulir, hanya saat ada kesalahan. |

`prefers-reduced-motion: reduce` mematikan semua jalur di atas dan langsung memasang
keadaan akhir. Tidak ada elemen yang berdenyut, melayang, atau berulang.

## Aturan komponen

- Satu titik fokus per layar. Di landing, judul hero. Di admin, tabel permintaan.
- Satu aksen pada satu momen: bara dipakai untuk judul `em`, status belum dihubungi,
  dan garis spectrum. Bukan untuk semua tombol.
- Tombol utama: latar `--ink`, teks kertas, hover bara. Tombol sekunder: garis
  `--rule-strong`, latar transparan.
- Tabel: header mono kapital, baris dipisah garis, hover `--paper-sunken`, angka
  rata kanan dengan `tabular-nums`.
- Paginasi: nomor mono, rentang `4–6 dari 12`, tombol prev/next nonaktif di ujung.
- Status kosong selalu menyebut sebab dan langkah berikutnya, bukan "tidak ada data".
- Setiap kontrol interaktif punya perilaku nyata; tidak ada tautan mati.

## Yang sengaja tidak dipakai

- Gradasi biru-ke-ungu, orb radial, kaca/blur, glow, grid latar, dan kartu seragam
  berbayang. Semuanya teknik tanpa alasan di sini.
- Video hero: klip yang ada adalah render neon, bukan produk. Hero sekarang tipografis.
- Ikon dekoratif. Panah hanya pada tombol yang memang mengarahkan (tautan keluar).
