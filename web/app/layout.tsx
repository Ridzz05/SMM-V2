import type { Metadata } from 'next';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import './atelier.css';
import './site.css';

export const metadata: Metadata = {
  title: 'Sistem Manajemen Gym | PT Solusi Mitra Mandiri',
  description:
    'Satu sistem untuk mengurus seluruh operasional gym: pendaftaran member, personal trainer, kasir toko, stok barang, jadwal kelas, pintu masuk, gaji karyawan, dan laporan keuangan. Dibuat oleh PT Solusi Mitra Mandiri untuk gym dan studio kebugaran di Indonesia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
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
