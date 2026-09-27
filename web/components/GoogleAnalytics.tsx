'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * ID properti GA4. Dikosongkan lewat NEXT_PUBLIC_GA_ID untuk mematikan
 * pelacakan sepenuhnya, misalnya di lingkungan pratinjau.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-TFKE3G9D2K';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Memuat gtag.js dan mengirim page_view untuk navigasi sisi klien.
 *
 * Tag di-inject lewat next/script, bukan <script> mentah di <head>, agar
 * urutan eksekusi mengikuti strategi afterInteractive dan tidak memicu
 * peringatan hidrasi. gtag('config') sudah mengirim page_view untuk muat
 * pertama, jadi hanya perpindahan rute berikutnya yang dikirim manual.
 * Tanpa itu, navigasi App Router tidak akan pernah tercatat.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!GA_ID) return;

    const page = pathname + window.location.search;
    if (lastTracked.current === page) return;

    const isInitialLoad = lastTracked.current === null;
    lastTracked.current = page;
    if (isInitialLoad) return;

    window.gtag?.('event', 'page_view', {
      page_path: page,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        id="ga-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
