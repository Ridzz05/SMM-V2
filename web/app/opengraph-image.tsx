import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

/**
 * Gambar pratinjau untuk WhatsApp, LinkedIn, X, dan Facebook.
 *
 * Dibuat dari kode, bukan berkas biner, supaya teksnya selalu ikut berubah
 * kalau judul diganti. Font serif disalin ke `assets/fonts/` dan dibaca dari
 * disk, bukan diunduh saat build: build tetap jalan tanpa jaringan, dan hasil
 * render identik setiap kali.
 */
export const alt = `${SITE_TAGLINE}, ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const [serif, sans] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/instrument-serif-400.ttf')),
    readFile(join(process.cwd(), 'assets/fonts/inter-400.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f6f4ef',
          padding: '72px 76px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 34, height: 3, background: '#1b5cf0' }} />
          <div style={{ width: 34, height: 3, background: '#c73312' }} />
          <div
            style={{
              fontSize: 20,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: '#63656d',
              marginLeft: 10,
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'Instrument Serif',
              fontSize: 92,
              lineHeight: 1.04,
              letterSpacing: -1,
              color: '#17181b',
              maxWidth: 960,
            }}
          >
            Semua urusan gym Anda, satu sistem saja.
          </div>
          <div style={{ fontSize: 26, color: '#45474d', marginTop: 28, maxWidth: 820 }}>
            Meja depan, personal trainer, kasir, pintu masuk, dan laporan keuangan dalam satu basis data.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #d9d4c9',
            paddingTop: 22,
            fontSize: 21,
            color: '#63656d',
          }}
        >
          <div>solusimitramandiri.com</div>
          <div style={{ color: '#c73312' }}>{SITE_TAGLINE}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Instrument Serif', data: serif, style: 'normal', weight: 400 },
        { name: 'Inter', data: sans, style: 'normal', weight: 400 },
      ],
    },
  );
}
