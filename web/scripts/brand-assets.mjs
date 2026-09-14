// Menurunkan aset merek web dari logo master di assets/.
// Master sudah berupa potongan alpha bersih (alpha biner di ~99.6% kanvas),
// jadi satu-satunya pekerjaan adalah memangkas margin transparan lalu mengemit
// ukuran yang benar-benar dipakai situs.
// Jalankan dari mana saja: `node web/scripts/brand-assets.mjs`.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = dirname(dirname(fileURLToPath(import.meta.url)));
const ROOT = dirname(WEB);
const SRC = join(ROOT, 'assets/solusimitramandiri-logo.png');
// Sama seperti seluruh citra situs lain: dilayani Go dari public/ di akar repo,
// bukan dari web/public/, karena /images/* di-rewrite ke server Go.
const OUT = join(ROOT, 'public/images/brand');
mkdirSync(OUT, { recursive: true });

const { width: W, height: H } = await sharp(SRC).metadata();
const raw = await sharp(SRC).ensureAlpha().raw().toBuffer();

let minX = W, minY = H, maxX = -1, maxY = -1;
for (let i = 3, n = 0; i < raw.length; i += 4, n++) {
  if (raw[i] > 8) {
    const x = n % W, y = (n / W) | 0;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
const cw = maxX - minX + 1, ch = maxY - minY + 1;
// 4% breathing room so nothing touches the canvas edge; the site supplies the
// real clear space via CSS padding (design.md §11: 25% of mark width).
const pad = Math.round(Math.max(cw, ch) * 0.04);
const left = Math.max(0, minX - pad), top = Math.max(0, minY - pad);
const width = Math.min(W - left, cw + pad * 2), height = Math.min(H - top, ch + pad * 2);
console.log(`master ${W}x${H} -> content ${cw}x${ch} -> canvas ${width}x${height}`);

const mark = sharp(SRC).ensureAlpha().extract({ left, top, width, height });
// Hanya ukuran yang benar-benar dipakai yang diemit. Header memakai 96 px
// (38 px CSS pada layar 2x), footer 192 px, dan 384 px menutup pemakaian
// besar sampai 120 px+ sesuai design.md §12. WebP dipilih agar konsisten
// dengan logo mitra dan jauh lebih ringan daripada PNG untuk gradien ini.
for (const h of [384, 192, 96]) {
  await mark.clone()
    .resize({ height: h, fit: 'inside' })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${OUT}/logo-mark-${h}.webp`);
}

// Favicon / app icon: mark centred on brand navy (design.md §7 surface-0).
const NAVY = { r: 7, g: 17, b: 31, alpha: 1 };
const icon = async (side, insetRatio, file) => {
  const inset = Math.round(side * insetRatio);
  await mark.clone()
    .resize(side - inset * 2, side - inset * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: inset, bottom: inset, left: inset, right: inset, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten({ background: NAVY })
    .png({ compressionLevel: 9 })
    .toFile(file);
};
await icon(512, 0.19, join(WEB, 'app/icon.png'));
await icon(180, 0.19, join(WEB, 'app/apple-icon.png'));

console.log('done');
