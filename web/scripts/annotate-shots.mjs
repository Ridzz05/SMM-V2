/**
 * Menulis anotasi ke tangkapan layar BossQueen sekali jalan.
 *
 * Kenapa dibakar ke gambar, bukan ditumpuk CSS: kotak yang diposisikan dengan
 * persen bergantung pada tinggi gambar yang dihitung peramban, dan itu membuat
 * nomor bergeser saat gambar mengecil. Menggambar langsung ke piksel membuat
 * hasilnya sama di semua lebar layar, dan tidak ada JavaScript di halaman.
 *
 * Jalankan: node web/scripts/annotate-shots.mjs
 * Sumber: web/assets/screenshots/*.png (tangkapan mentah) + rect di bawah.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(import.meta.dirname, '..', '..');
const OUT = join(ROOT, 'public', 'images', 'produk');

const EMBER = '#c73312';
const PAPER = '#f6f4ef';

/** Kotak sorot: [kiri, atas, lebar, tinggi] dalam piksel gambar. */
const SHOTS = [
  {
    id: 'desktop',
    src: join(ROOT, 'web', 'assets', 'screenshots', 'bossqueen-desktop.png'),
    out: join(OUT, 'bossqueen-desktop.webp'),
    /** Tangkapan diambil pada 1440x900 dengan skala 1.25, jadi 1800x1125. */
    boxes: [
      [26, 88, 318, 43], // 1 pencarian menu
      [26, 472, 305, 30], // 2 grup Customer Service
      [81, 1068, 228, 22], // 3 akun staf
      [1711, 19, 45, 45], // 4 notifikasi dan monitor
      [410, 115, 112, 40], // 5 judul halaman
      [1144, 129, 173, 40], // 6 pintasan kiosk
      [410, 233, 1331, 143], // 7 perlu tindak lanjut
      [410, 406, 1331, 328], // 8 status keanggotaan
      [410, 764, 1331, 328], // 9 kunjungan hari ini
      [1710, 1035, 60, 60], // 10 chatbot melayang
    ],
  },
  {
    id: 'mobile',
    src: join(ROOT, 'web', 'assets', 'screenshots', 'bossqueen-mobile.png'),
    out: join(OUT, 'bossqueen-mobile.webp'),
    /** Tangkapan 390x844 dengan skala 1.25, jadi 488x1055. */
    boxes: [
      [21, 12, 55, 55], // 1 tombol menu
      [340, 12, 105, 55], // 2 notifikasi dan monitor
      [20, 110, 93, 35], // 3 judul dan ringkasan
      [20, 188, 173, 40], // 4 pintasan kiosk
      [21, 330, 427, 66], // 5 perlu tindak lanjut
      [21, 493, 427, 121], // 6 status keanggotaan
      [41, 634, 387, 160], // 7 kartu angka
    ],
  },
];

/** Nomor di kiri-atas kotak, di luar garis, dengan cincin warna kertas. */
function chip(no, x, y, size) {
  const r = size / 2;
  return `
    <circle cx="${x}" cy="${y}" r="${r + 2}" fill="${PAPER}" />
    <circle cx="${x}" cy="${y}" r="${r}" fill="${EMBER}" />
    <text x="${x}" y="${y + 1}" text-anchor="middle" dominant-baseline="central"
      font-family="ui-monospace, Menlo, monospace" font-size="${size * 0.62}"
      font-weight="500" fill="#ffffff">${no}</text>`;
}

function overlay(width, height, boxes) {
  const size = Math.max(16, Math.round(width * 0.017));
  const stroke = Math.max(1.5, width * 0.0012);
  const parts = boxes.map(([x, y, w, h], i) => {
    const cx = Math.max(size / 2 + 2, x);
    const cy = Math.max(size / 2 + 2, y);
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"
        fill="none" stroke="${PAPER}" stroke-width="${stroke + 2}" opacity="0.85" />
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"
        fill="none" stroke="${EMBER}" stroke-width="${stroke}" />
      ${chip(i + 1, cx, cy, size)}`;
  });

  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`,
  );
}

await mkdir(OUT, { recursive: true });

for (const shot of SHOTS) {
  const meta = await sharp(shot.src).metadata();
  const annotated = await sharp(shot.src)
    .composite([{ input: overlay(meta.width, meta.height, shot.boxes), top: 0, left: 0 }])
    .webp({ quality: 86 })
    .toBuffer();

  await writeFile(shot.out, annotated);
  console.log(`${shot.id}: ${meta.width}x${meta.height} → ${Math.round(annotated.length / 1024)} KB`);
}
