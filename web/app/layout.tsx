import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Instrument_Serif, Inter } from 'next/font/google';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { GOOGLE_VERIFICATION, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/seo';
import './design.css';

/**
 * Font di-host sendiri oleh Next, bukan lewat <link> ke fonts.googleapis.com.
 * Dua alasan: tidak ada permintaan pihak ketiga di jalur render (LCP lebih
 * cepat dan tidak ada FOUT), dan `size-adjust` fallback buatan Next menjaga
 * CLS tetap nol saat font selesai dimuat.
 */
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_TAGLINE} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'id_ID',
    title: `${SITE_TAGLINE} | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_TAGLINE} | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: { google: GOOGLE_VERIFICATION },
  formatDetection: { telephone: true, address: false, email: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#121316' },
  ],
  colorScheme: 'light dark',
};

/**
 * Skrip tema dijalankan sebelum cat pertama: memasang `data-theme` dari
 * localStorage atau preferensi sistem, lalu menandai <html> dengan `js` supaya
 * aturan "sembunyikan sebelum animasi" hanya berlaku kalau JS memang hidup.
 */
const BOOT = `(function(){try{var s=localStorage.getItem('smm-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=s==='dark'||s==='light'?s:(d?'dark':'light');}catch(e){document.documentElement.dataset.theme='light';}document.documentElement.classList.add('js');})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
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
