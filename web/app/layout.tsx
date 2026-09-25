import type { Metadata } from 'next';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import './atelier.css';
import './site.css';

export const metadata: Metadata = {
  title: 'All-In-One (AIO) Gym Management | PT Solusi Mitra Mandiri',
  description:
    'Sistem manajemen gym All-In-One (AIO) oleh PT Solusi Mitra Mandiri: platform terpadu untuk industri kebugaran Indonesia. CRM, keanggotaan, kasir, inventaris, jadwal kelas, personal training, absensi biometrik, payroll komisi, dan laporan keuangan dalam satu basis data.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
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
