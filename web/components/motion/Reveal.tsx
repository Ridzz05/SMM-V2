'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCED } from '@/lib/motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  y?: number;
};

/**
 * Satu blok masuk saat masuk viewport.
 *
 * Gerak dipakai untuk menandai "konten baru mulai di sini", bukan hiasan:
 * 22px naik + fade, sekali saja (`once`), lalu ScrollTrigger dilepas.
 * `matchMedia` memisahkan jalur gerak-minimal supaya pengguna yang meminta
 * diam langsung mendapat keadaan akhir, tanpa tween yang dibatalkan.
 */
export function Reveal({ children, className, as: Tag = 'div', delay = 0, y = 22 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          el,
          { y, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            delay,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top bottom-=32', once: true },
          },
        );
      });

      mm.add(MOTION_REDUCED, () => {
        gsap.set(el, { y: 0, autoAlpha: 1 });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} data-reveal>
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  stagger?: number;
};

/**
 * Daftar yang masuk berurutan, satu ScrollTrigger per anak.
 *
 * Versi batch sempat dipakai dan gagal untuk grup yang posisinya baru pasti
 * setelah font dan gambar selesai dimuat: sebagian anak tidak pernah memicu
 * `onEnter` sehingga tertinggal `visibility: hidden`. Trigger per anak lebih
 * murah untuk diperiksa dan tetap memberi jeda berurutan lewat `delay`.
 */
export function RevealGroup({ children, className, as: Tag = 'div', stagger = 0.07 }: RevealGroupProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', el);
      if (items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        items.forEach((item, index) => {
          gsap.fromTo(
            item,
            { y: 20, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              delay: index * stagger,
              ease: 'power3.out',
              scrollTrigger: { trigger: item, start: 'top bottom-=32', once: true },
            },
          );
        });
      });

      mm.add(MOTION_REDUCED, () => {
        gsap.set(items, { y: 0, autoAlpha: 1 });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
