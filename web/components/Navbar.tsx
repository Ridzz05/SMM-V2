'use client';

import { useState, useEffect } from 'react';

type NavbarProps = {
  brandMarkImg: React.ReactNode;
};

export default function Navbar({ brandMarkImg }: NavbarProps) {
  const [open, setOpen] = useState(false);

  // Tutup menu dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="nav">
      <div className="container wide">
        <div className="nav-inner">
          <a className="brand" href="#top" onClick={() => setOpen(false)}>
            {brandMarkImg}
            <span className="brand-name">Solusi Mitra Mandiri</span>
          </a>

          {/* Navigasi Desktop */}
          <nav className="nav-desktop" aria-label="Navigasi utama">
            <ul className="nav-links">
              <li>
                <a href="#masalah">Masalah</a>
              </li>
              <li>
                <a href="#domain">Fitur &amp; Modul</a>
              </li>
              <li>
                <a href="#kontrol">Kontrol Server</a>
              </li>
              <li>
                <a href="#mitra">Mitra Gym</a>
              </li>
              <li>
                <a href="#team">Tim</a>
              </li>
            </ul>
          </nav>

          {/* Aksi Desktop */}
          <div className="nav-actions nav-desktop-actions">
            <a className="nav-link-ghost" href="/admin/login">
              Portal Admin
            </a>
            <a className="btn btn-primary" href="#demo">
              Jadwalkan Demo
            </a>
          </div>

          {/* Tombol Hamburger Mobile */}
          <div className="nav-mobile-toggle-wrap">
            <a className="btn btn-primary btn-sm mobile-cta-compact" href="#demo">
              Demo
            </a>
            <button
              type="button"
              className="nav-mobile-btn"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-nav-menu"
              aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'}
            >
              <span className={`nav-hamburger ${open ? 'is-open' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Panel Menu Mobile */}
        {open ? (
          <div className="nav-mobile-panel" id="mobile-nav-menu">
            <nav aria-label="Navigasi ponsel">
              <ul className="nav-mobile-links">
                <li>
                  <a href="#masalah" onClick={() => setOpen(false)}>
                    Diagnosa Masalah
                  </a>
                </li>
                <li>
                  <a href="#domain" onClick={() => setOpen(false)}>
                    9 Pilar Modul Domain
                  </a>
                </li>
                <li>
                  <a href="#kontrol" onClick={() => setOpen(false)}>
                    Kontrol Validasi Server
                  </a>
                </li>
                <li>
                  <a href="#mitra" onClick={() => setOpen(false)}>
                    Jaringan Mitra Gym
                  </a>
                </li>
                <li>
                  <a href="#team" onClick={() => setOpen(false)}>
                    Tim Pengembang
                  </a>
                </li>
                <li>
                  <a href="/admin/login" onClick={() => setOpen(false)}>
                    Portal Admin
                  </a>
                </li>
              </ul>
            </nav>

            <div className="nav-mobile-actions">
              <a
                className="btn btn-primary btn-mobile-full"
                href="#demo"
                onClick={() => setOpen(false)}
              >
                Jadwalkan Demo Langsung
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
