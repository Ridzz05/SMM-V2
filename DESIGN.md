---
version: 1.0.0
name: aio-flat-minimal
category: "Modern & Minimal"
description: "Two-dimensional minimalist style with vibrant system colors, clean typography, and zero 3D effects for fast, user-friendly enterprise interfaces. Built for AIO by PT Solusi Mitra Mandiri."

dials:
  energy: 1
  rhythm: 2
  motion: 1

colors:
  primary: "#e45c37"
  primary-hover: "#e89a64"
  secondary: "#3ba1e1"
  secondary-hover: "#60b5e8"
  system-blue: "#3ba1e1"
  system-blue-deep: "#23539a"
  system-blue-shadow: "#193469"
  success: "#16a34a"
  success-surface: "rgba(22, 163, 74, 0.12)"
  warning: "#d97706"
  danger: "#dc2626"
  canvas: "#07111f"
  surface-1: "#0b1626"
  surface-2: "#101a28"
  text-primary: "#f5f7fa"
  text-secondary: "#aab6c5"
  text-faint: "#8b99ab"
  border-subtle: "rgba(255, 255, 255, 0.08)"
  border-strong: "rgba(255, 255, 255, 0.16)"
  border-focus: "#3ba1e1"

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
    background: "{colors.primary}"
    textColor: "{colors.text-primary}"
    shadow: "none"
    rounded: "9999px"
    padding: "10px 22px"
    transition: "background 150ms ease"
  button-secondary:
    background: "transparent"
    borderColor: "{colors.border-subtle}"
    textColor: "{colors.text-primary}"
    shadow: "none"
    rounded: "9999px"
    padding: "10px 22px"
    transition: "border-color 150ms ease, color 150ms ease"
  card:
    background: "{colors.surface-1}"
    border: "1px solid {colors.border-subtle}"
    shadow: "none"
    rounded: "10px"
    padding: "24px 28px"
---

# Design System Inspired by Flat (AIO Edition)

> Kategori: Modern & Minimal
> Gaya minimalis dua dimensi (2D) dengan warna sistem kontras tinggi, tipografi bersih, dan tanpa efek 3D untuk antarmuka yang cepat dan berorientasi pengguna.

---

## 1. Visual Theme & Atmosphere

Gaya minimalis dua dimensi dengan ketajaman warna sistem, tata letak berbasis ruang (whitespace), dan eliminasi penuh efek 3D (tanpa drop-shadows, tanpa efek timbul, tanpa translasi melayang).

- **Gaya visual**: Minimalis, enterprise, 2D flat murni.
- **Sikap warna**: Menggunakan palet warna sistem aktif (Navy `#07111F` sebagai kanvas, Oranye `#E45C37` untuk aksi utama, Biru `#3BA1E1` untuk status/data sistem).
- **Tujuan desain**: Menghadirkan antarmuka operasional yang tenang, cepat dimuat, berkecepatan tinggi, dan fokus pada keterbacaan data.

---

## 2. Sistem Warna (Warna Sistem Aktif)

- **Primary (`#E45C37`)**: Penekanan aksi utama (CTA), tombol submit, dan penanda urgensi.
- **Primary Hover (`#E89A64`)**: Transisi 2D datar untuk status hover aksi utama.
- **Secondary / System Blue (`#3BA1E1`)**: Indikator status sistem, outline fokus, tag telemetri, dan tautan sistem.
- **Canvas (`#07111F`)**: Latar belakang utama seluruh halaman (Obsidian Navy).
- **Surface 1 (`#0B1626`)**: Latar datar untuk kartu, panel, dan header navigasi.
- **Surface 2 (`#101A28`)**: Latar datar untuk elemen input form dan dialog.
- **Text Primary (`#F5F7FA`)**: Teks judul dan bodi utama (kontras 16.2:1 vs Canvas).
- **Text Secondary (`#AAB6C5`)**: Deskripsi modul dan label sekunder (kontras 8.5:1 vs Canvas).
- **Text Faint (`#8B99AB`)**: Metadata, nomor indeks, dan teks hak cipta.
- **Border Subtle (`rgba(255, 255, 255, 0.08)`)**: Garis pembatas datar 1px antarblok konten.
- **Success (`#16A34A` / `#5FBF7F`)**: Status sukses dan operasional normal.
- **Warning (`#D97706` / `#F5A623`)**: Status peringatan dan pending.
- **Danger (`#DC2626` / `#E45C37`)**: Status kritis dan tombol destruktif.

---

## 3. Tipografi

- **Skala Ukuran**: 12px, 14px, 16px, 20px, 24px, 32px, 42px.
- **Font Families**:
  - Teks Bodi & Form: `Inter`
  - Judul & Display: `Plus Jakarta Sans`
  - Monospace Data & Kode: `IBM Plex Mono`
- **Bobot**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold).
- Judul membawa karakter tegas dan percaya diri; teks bodi memaksimalkan kemudahan pemindaian (*scanability*) dan kontras tinggi.

---

## 4. Spacing & Grid

- **Skala Spacing**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px.
- Menjaga ritme vertikal yang konsisten di seluruh seksi dan komponen.
- Menyelaraskan modul ke dalam grid yang dapat diprediksi (2-kolom untuk diagnosa masalah, 3-kolom untuk modul domain, 4-kolom untuk mekanisme kontrol); menghindari offset ad-hoc.

---

## 5. Tata Letak & Komposisi Flat

- Mengutamakan blok konten yang tegas dengan padding internal yang seragam.
- Menjaga hierarki yang jelas: Judul -> Teks Penjelas -> Aksi Utama.
- Menggunakan ruang putih (*whitespace*) untuk memisahkan konteks sebelum menambahkan garis tepi atau pembatas.
- Tanpa efek bayangan 3D (*no box-shadows*). Kedalaman dibaca dari kontras permukaan (`#07111F` -> `#0B1626`).

---

## 6. Komponen

- **Tombol**:
  - Aksi primer menggunakan `#E45C37` solid, teks kontras, tanpa bayangan 3D.
  - Aksi sekunder menggunakan latar transparan dengan garis tepi 1px netral.
- **Input Form**:
  - Latar `#101A28`, garis batas datar 1px.
  - Status `:focus-visible` tegas: outline 2px solid `#3BA1E1` dengan offset 2px.
  - Label jelas dan pesan error yang terprediksi.
- **Kartu & Seksi**:
  - Radius konsisten (8px - 12px), garis batas 1px datar, tanpa drop shadow.

---

## 7. Motion & Interaksi (2D Transisi Singkat)

- Menggunakan transisi 2D halus yang menekankan `#E45C37` dan `#3BA1E1` sebagai sinyal interaksi.
- Default durasi transisi singkat dan bertujuan: **150ms–200ms** dengan kurva stabil (`ease`).
- Tanpa translasi fisik 3D (`transform: translateY(-2px)` ditiadakan). Interaksi hover ditandai dengan perubahan warna garis tepi (*border-color*) secara datar.
- Memastikan status `hover`, `focus-visible`, `active`, `disabled`, dan `loading` terdefinisi eksplisit.

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
- **Dilarang** memakai warna di luar palet token sistem yang telah ditetapkan.
