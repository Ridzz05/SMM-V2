'use client';

import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * Satu tempat pendaftaran plugin GSAP.
 *
 * `useGSAP` didaftarkan sebagai plugin supaya hook ikut memakai versi GSAP yang
 * sama dengan yang diimpor komponen (masalah versi ganda di React). Plugin lain
 * hanya didaftarkan di browser: modul ini ikut dievaluasi saat SSR, dan
 * ScrollTrigger/SplitText tidak punya arti tanpa DOM.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'power3.out', duration: 0.7 });
}

/** Media query yang dipakai semua animasi; satu sumber kebenaran. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const MOTION_REDUCED = '(prefers-reduced-motion: reduce)';

export { gsap, useGSAP, ScrollTrigger, SplitText };
