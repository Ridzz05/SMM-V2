import type { Metadata } from 'next';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import './design.css';

export const metadata: Metadata = {
  title: 'Sistem Manajemen Gym | PT Solusi Mitra Mandiri',
  description:
    'Satu sistem untuk mengurus seluruh operasional gym: pendaftaran member, personal trainer, kasir toko, stok barang, jadwal kelas, pintu masuk, gaji karyawan, dan laporan keuangan. Dibuat oleh PT Solusi Mitra Mandiri untuk gym dan studio kebugaran di Indonesia.',
};

/**
 * Skrip tema dijalankan sebelum cat pertama: memasang `data-theme` dari
 * localStorage atau preferensi sistem, lalu menandai <html> dengan `js` supaya
 * aturan "sembunyikan sebelum animasi" hanya berlaku kalau JS memang hidup.
 */
const BOOT = `(function(){try{var s=localStorage.getItem('smm-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=s==='dark'||s==='light'?s:(d?'dark':'light');}catch(e){document.documentElement.dataset.theme='light';}document.documentElement.classList.add('js');})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Lewati ke konten utama
        </a>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
