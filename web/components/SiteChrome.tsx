'use client';

import { useEffect } from 'react';

const SHOW_TOP = 100;
const DELTA = 6;

/**
 * Perilaku halaman yang bergantung pada DOM dan preferensi pengguna:
 * 1. Reveal on-scroll untuk seluruh elemen [data-reveal].
 * 2. Header yang menyembunyikan diri saat menggulir ke bawah.
 *
 * Keduanya dimatikan total saat pengguna meminta gerak minimal, sehingga
 * konten langsung terlihat tanpa animasi apa pun.
 */
export default function SiteChrome() {
  useEffect(() => {
    const root = document.documentElement;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const header = document.querySelector<HTMLElement>('header.nav');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) {
      reveals.forEach((el) => el.setAttribute('data-revealed', 'true'));
      return;
    }

    reveals.forEach((el) => el.setAttribute('data-revealed', 'false'));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', 'true');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    reveals.forEach((el) => observer.observe(el));

    let lastY = window.scrollY;
    const onScroll = () => {
      if (!header) return;
      const y = window.scrollY;
      const goingDown = y > lastY;

      if (goingDown && y > SHOW_TOP && Math.abs(y - lastY) > DELTA) {
        header.classList.add('is-hidden');
      } else if (!goingDown) {
        header.classList.remove('is-hidden');
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Berguna untuk debugging dan untuk memastikan animasi marquee ikut
    // menghormati preferensi pengguna yang berubah saat halaman terbuka.
    const onPreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        reveals.forEach((el) => el.setAttribute('data-revealed', 'true'));
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }
    };
    reduceMotion.addEventListener('change', onPreferenceChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      reduceMotion.removeEventListener('change', onPreferenceChange);
    };
  }, []);

  return null;
}
