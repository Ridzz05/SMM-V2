'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'smm-theme';

/**
 * Tombol tema. Tema awal dipasang skrip inline di <head> (lihat layout.tsx)
 * supaya tidak ada kedipan, jadi komponen ini hanya membaca hasilnya dan
 * menukar atribut `data-theme` di <html>.
 *
 * Pilihan disimpan di localStorage; kalau pengguna belum pernah memilih,
 * sistem operasi yang menentukan.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'dark' ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Mode privat memblokir localStorage; tema tetap berlaku untuk sesi ini.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Pakai tema terang' : 'Pakai tema gelap'}
      title={theme === 'dark' ? 'Tema terang' : 'Tema gelap'}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7" />
          </>
        ) : (
          <path d="M20.5 14.4A8.6 8.6 0 0 1 9.6 3.5a8.6 8.6 0 1 0 10.9 10.9Z" />
        )}
      </svg>
    </button>
  );
}
