'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap, useGSAP, SplitText, MOTION_OK } from '@/lib/motion';

type SplitHeadlineProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
};

/**
 * Judul dibagi per baris oleh SplitText, tiap baris naik dari balik topengnya.
 *
 * Alasan gerak: judul adalah titik fokus layar, jadi ia yang "berbicara" lebih
 * dulu; isi lain menyusul dengan gerak yang lebih kecil. `mask: 'lines'`
 * membuat topeng per baris tanpa markup tambahan di JSX, dan `split.revert()`
 * mengembalikan DOM asli saat komponen dilepas (dipanggil otomatis oleh
 * useGSAP lewat context, ditambah cleanup manual di sini untuk kejelasan).
 *
 * Topeng dilepas setelah animasi selesai. Topeng SplitText memotong tepat di
 * kotak baris, sementara kotak huruf Instrument Serif lebih tinggi: pada 72px
 * font, ascent + descent 93px tetapi line box display hanya 79px. Selama
 * animasi potongan itu yang diinginkan; setelah selesai ia memotong descender
 * "g" dan "y" secara permanen, dan `overflow-clip-margin` tidak menolong
 * karena tetap dipotong di kotak garis. Jadi begitu baris berhenti bergerak,
 * `overflow` dikembalikan ke `visible`.
 */
export function SplitHeadline({ children, className, as: Tag = 'h2', delay = 0 }: SplitHeadlineProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Ditampilkan lebih dulu: kalau animasi gagal karena alasan apa pun,
      // judul tetap terbaca. SplitText berjalan sinkron di efek tata letak ini,
      // jadi tidak ada kedipan sebelum baris terpecah.
      gsap.set(el, { visibility: 'visible' });

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
        const unmask = () => {
          split.lines.forEach((line) => {
            const mask = line.parentElement;
            // `display: contents` melepas topeng dari tata letak tanpa
            // menyentuh anaknya: baris kembali setinggi line box aslinya, dan
            // descender "g"/"y" tidak lagi dipotong karena tidak ada kotak yang
            // memotong. Ini lebih tepat daripada menaikkan tinggi topeng, yang
            // mengubah jarak antarbaris.
            if (mask) mask.style.display = 'contents';
          });
        };

        gsap.from(split.lines, {
          yPercent: 115,
          duration: 0.95,
          delay,
          stagger: 0.075,
          ease: 'power4.out',
          onComplete: unmask,
          scrollTrigger: { trigger: el, start: 'top bottom-=32', once: true },
        });

        // Jaring pengaman: kalau tween tidak pernah selesai (tab tidak pernah
        // terlihat, misalnya), lepas topeng setelah waktu maksimum yang wajar.
        const timer = window.setTimeout(unmask, 3000);

        return () => {
          window.clearTimeout(timer);
          split.revert();
        };
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} data-split>
      {children}
    </Tag>
  );
}
