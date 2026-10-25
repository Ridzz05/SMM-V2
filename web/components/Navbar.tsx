'use client';

import { useEffect, useRef, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from '@/lib/motion';

const SECTIONS = [
  { id: 'masalah', label: 'Masalah' },
  { id: 'modul', label: 'Modul' },
  { id: 'produk', label: 'Tampilan' },
  { id: 'aturan', label: 'Aturan' },
  { id: 'mitra', label: 'Mitra' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tanya', label: 'Tanya' },
  { id: 'tim', label: 'Tim' },
] as const;

/** Seksi yang dilacak untuk penanda posisi, termasuk yang tidak punya tautan. */
const TRACKED = [...SECTIONS.map((section) => section.id), 'demo'];

/**
 * Navigasi utama.
 *
 * Tiga gerak, tiga alasan:
 * 1. Garis spectrum di bawah bar = progres gulir (pengguna tahu posisinya).
 * 2. Garis bawah tautan = posisi seksi aktif (orientasi di halaman panjang).
 * 3. Lembar mobile = urutan masuk berstagger supaya item terbaca satu per satu.
 * Semua dibuat di dalam useGSAP sehingga ikut dibersihkan saat unmount.
 */
export default function Navbar({ brandMark }: { brandMark: React.ReactNode }) {
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
          });
        }
      });

      TRACKED.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: 'top 42%',
          end: 'bottom 42%',
          onToggle: (self) => {
            if (self.isActive) setActive(id);
          },
        });
      });
    },
    { scope: navRef },
  );

  useGSAP(
    () => {
      const sheet = sheetRef.current;
      if (!sheet) return;
      const items = gsap.utils.toArray<HTMLElement>('[data-sheet-item]', sheet);
      gsap.fromTo(
        sheet,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2, ease: 'power2.out' },
      );
      gsap.fromTo(
        items,
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.045, ease: 'power3.out' },
      );
    },
    { dependencies: [open], scope: navRef, revertOnUpdate: true },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="nav" ref={navRef}>
      <div className="nav-progress" ref={progressRef} aria-hidden="true" />
      <div className="wrap">
        <div className="nav-inner">
          <a className="brand" href="#top" aria-label="PT Solusi Mitra Mandiri, ke atas halaman">
            {brandMark}
            <span className="brand-text">
              <strong>Solusi Mitra Mandiri</strong>
              <span>Sistem Gym</span>
            </span>
          </a>

          <nav aria-label="Navigasi utama">
            <ul className="nav-links">
              {SECTIONS.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-actions">
            <ThemeToggle />
            <a className="link-quiet" href="/admin/login">
              Masuk Admin
            </a>
            <a className="btn btn-sm" href="#demo">
              Jadwalkan Demo
            </a>
            <button
              type="button"
              className="icon-btn nav-burger"
              aria-expanded={open}
              aria-controls="nav-sheet"
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
              onClick={() => setOpen((value) => !value)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="nav-sheet" id="nav-sheet" ref={sheetRef}>
          <div className="wrap">
            <div className="nav-sheet-inner">
              {SECTIONS.map(({ id, label }) => (
                <a key={id} href={`#${id}`} data-sheet-item onClick={() => setOpen(false)}>
                  {label}
                </a>
              ))}
              <a href="/admin/login" data-sheet-item onClick={() => setOpen(false)}>
                Masuk Admin
              </a>
              <a className="btn" href="#demo" data-sheet-item onClick={() => setOpen(false)}>
                Jadwalkan Demo
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
