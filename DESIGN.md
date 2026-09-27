---
version: 2.0.0
name: aio-flat-minimal
category: "Modern & Minimal — Professional Monochrome"
description: "Gaya minimalis dua dimensi: kanvas putih bersih, hierarki monokrom, tanpa efek 3D. Satu-satunya warna adalah warna status semantik, dan warna itu tidak pernah jadi satu-satunya penanda makna. Dibuat untuk AIO oleh PT Solusi Mitra Mandiri."

dials:
  energy: 1
  rhythm: 2
  motion: 1

colors:
  canvas: "#ffffff"
  surface-1: "#f7f8f9"
  surface-2: "#eef0f2"
  text-primary: "#111827"
  text-secondary: "#4b5563"
  text-faint: "#5b6472"
  border-subtle: "#e5e7eb"
  border-strong: "#d1d5db"
  border-control: "#7d8590"
  action-primary: "#111827"
  action-hover: "#1f2937"
  success: "#166534"
  success-surface: "#f0f7f2"
  warning: "#92400e"
  warning-surface: "#fdf6ec"
  danger: "#b91c1c"
  danger-surface: "#fdf2f2"

typography:
  scale: [12, 14, 16, 20, 24, 32, 42]
  families:
    primary: "Inter"
    display: "Plus Jakarta Sans"
    mono: "IBM Plex Mono"
  weights: [400, 500, 600, 700, 800]

spacing:
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96]
  container: 1200px
  container-wide: 1280px

components:
  button-primary:
    background: "{colors.action-primary}"
    textColor: "{colors.canvas}"
    shadow: "none"
    rounded: "9999px"
    padding: "10px 22px"
    transition: "background 150ms ease"
  button-secondary:
    background: "transparent"
    borderColor: "{colors.border-control}"
    textColor: "{colors.text-primary}"
    shadow: "none"
    rounded: "9999px"
    padding: "10px 22px"
    transition: "border-color 150ms ease, color 150ms ease"
  card:
    background: "{colors.canvas}"
    border: "1px solid {colors.border-subtle}"
    shadow: "none"
    rounded: "10px"
    padding: "24px 28px"
---

# Design System Inspired by Flat (AIO Edition)

> Kategori: Modern & Minimal — Monokrom Profesional
> Gaya minimalis dua dimensi (2D) dengan kanvas putih bersih, hierarki monokrom, dan tanpa efek 3D untuk antarmuka yang cepat dan berorientasi pengguna.

---

## 1. Visual Theme & Atmosphere

Gaya minimalis dua dimensi dengan kanvas putih, hierarki yang dibaca dari bobot teks dan garis 1px, serta eliminasi penuh efek 3D (tanpa drop-shadows, tanpa efek timbul, tanpa translasi melayang).

- **Gaya visual**: Minimalis, enterprise, 2D flat murni, monokrom.
- **Sikap warna**: Monokrom. Kanvas `#FFFFFF`, teks `#111827`, garis `#E5E7EB`. Tidak ada warna aksen dekoratif. Satu-satunya kroma adalah warna status semantik (sukses, peringatan, bahaya).
- **Tujuan desain**: Menghadirkan antarmuka operasional yang tenang, netral, dan fokus pada keterbacaan data — bukan pada daya tarik visual.

---

## 2. Sistem Warna (Monokrom + Status Semantik)

### Monokrom

- **Canvas (`#FFFFFF`)**: Latar belakang utama seluruh halaman.
- **Surface 1 (`#F7F8F9`)**: Latar panel, kartu, dan header navigasi. Kedalaman dibaca dari perbedaan permukaan, bukan dari bayangan.
- **Surface 2 (`#EEF0F2`)**: Latar input form, tombol outline, dan badge netral.
- **Text Primary (`#111827`)**: Judul dan bodi utama (kontras 17.7:1 vs Canvas).
- **Text Secondary (`#4B5563`)**: Deskripsi modul dan label sekunder (kontras 7.6:1 vs Canvas).
- **Text Faint (`#5B6472`)**: Metadata, nomor indeks, teks hak cipta (kontras 6.0:1 vs Canvas).
- **Action Primary (`#111827`)**: Latar tombol aksi utama. Teks putih di atasnya (17.7:1).
- **Action Hover (`#1F2937`)**: Status hover tombol aksi utama.
- **Border Subtle (`#E5E7EB`)**: Garis pembatas dekoratif 1px antarblok konten.
- **Border Strong (`#D1D5DB`)**: Garis pembatas dekoratif yang lebih tegas.
- **Border Control (`#7D8590`)**: Batas kontrol interaktif (input, tombol outline, select). Wajib ≥3:1 agar batas kontrol terbaca (3.7:1 vs Canvas).

### Status Semantik

Hanya tiga warna di luar monokrom. Masing-masing punya varian teks (kontras ≥4.5:1) dan varian permukaan (tint latar).

- **Success (`#166534` / surface `#F0F7F2`)**: Status sukses dan operasional normal.
- **Warning (`#92400E` / surface `#FDF6EC`)**: Status peringatan dan pending.
- **Danger (`#B91C1C` / surface `#FDF2F2`)**: Status kritis dan tombol destruktif.

> **Aturan**: warna status tidak pernah menjadi satu-satunya pembawa makna. Setiap badge atau pesan status wajib menyertakan label teks.

---

## 3. Tipografi

- **Skala Ukuran**: 12px, 14px, 16px, 20px, 24px, 32px, 42px.
- **Font Families**:
  - Teks Bodi & Form: `Inter`
  - Judul & Display: `Plus Jakarta Sans`
  - Monospace Data & Kode: `IBM Plex Mono`
- **Bobot**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold).
- Tanpa warna, hierarki dibawa oleh **bobot dan ukuran**. Judul 700–800, bodi 400–500, metadata 500–600 dengan warna lebih redup.
- Penekanan di dalam judul (`<em>`) ditandai dengan **garis bawah 2px**, bukan dengan warna aksen.

---

## 4. Spacing & Grid

- **Skala Spacing**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px.
- Menjaga ritme vertikal yang konsisten di seluruh seksi dan komponen.
- Menyelaraskan modul ke dalam grid yang dapat diprediksi (2-kolom untuk diagnosa masalah, 3-kolom untuk modul domain, 4-kolom untuk mekanisme kontrol); menghindari offset ad-hoc.

---

## 5. Tata Letak & Komposisi Flat

- Mengutamakan blok konten yang tegas dengan padding internal yang seragam.
- Menjaga hierarki yang jelas: Judul → Teks Penjelas → Aksi Utama.
- Menggunakan ruang putih (*whitespace*) untuk memisahkan konteks sebelum menambahkan garis tepi atau pembatas.
- Tanpa efek bayangan 3D (*no box-shadows*). Kedalaman dibaca dari kontras permukaan (`#FFFFFF` → `#F7F8F9` → `#EEF0F2`).

---

## 6. Komponen

- **Tombol**:
  - Aksi primer menggunakan `#111827` solid dengan teks putih, tanpa bayangan 3D.
  - Aksi sekunder menggunakan latar transparan dengan garis tepi 1px `#7D8590`.
  - Aksi destruktif memakai teks dan garis `#B91C1C`.
- **Input Form**:
  - Latar `#EEF0F2`, garis batas 1px `#7D8590`.
  - Status `:focus-visible` tegas: outline 2px solid `#111827` dengan offset 2px. Offset 1px dilarang — cincin akan menempel pada garis batas.
  - Label jelas dan pesan error yang terprediksi.
- **Badge Status**:
  - Bentuk pill, latar tint semantik, teks semantik gelap, selalu disertai label.
- **Kartu & Seksi**:
  - Radius konsisten (8px – 12px), garis batas 1px datar, tanpa drop shadow.
  - Kartu memakai `#FFFFFF` dengan garis `#E5E7EB`; panel admin memakai `#F7F8F9`.

---

## 7. Motion & Interaksi (2D Transisi Singkat)

- Menggunakan transisi 2D halus yang menekankan perubahan **warna permukaan dan garis tepi**, bukan warna aksen.
- Default durasi transisi singkat dan bertujuan: **150ms–200ms** dengan kurva stabil (`ease`).
- Tanpa translasi fisik 3D (`transform: translateY(-2px)` ditiadakan). Interaksi hover ditandai dengan perubahan warna garis tepi (*border-color*) secara datar.
- Memastikan status `hover`, `focus-visible`, `active`, `disabled`, dan `loading` terdefinisi eksplisit.
- **`@media (prefers-reduced-motion: reduce)` wajib menonaktifkan seluruh transisi dan animasi.**

---

## 8. Voice & Brand

- Nada ringkas, percaya diri, dan berorientasi pada produk nyata.
- Menghindari bahasa jargon pemasaran kecerdasan buatan yang berlebihan.
- Mempertahankan integritas label antarmuka yang lugas dan terhubung langsung ke basis data operasional.

---

## 9. Anti-Patterns (Dilarang)

- **Dilarang** menambahkan efek bayangan 3D (*drop shadows*) yang membuat elemen tampak melayang.
- **Dilarang** menggunakan animasi translasi melompat/terangkat saat hover.
- **Dilarang** menambahkan efek gradien dekoratif atau orbs latar yang mengurangi kontras dan keterbacaan.
- **Dilarang** memakai warna di luar palet token sistem yang telah ditetapkan — termasuk warna merek pihak ketiga (WhatsApp, dsb.).
- **Dilarang** memakai warna aksen dekoratif (oranye, biru, navy) sebagai penanda seksi, nomor indeks, atau label eyebrow. Hierarki dibawa oleh bobot, ukuran, dan ruang.
- **Dilarang** menampilkan badge "eyebrow" atau chip berwarna di atas judul hero. Judul hero dimulai langsung dari headline.
- **Dilarang** memakai offset `outline` selain 2px pada status fokus.
