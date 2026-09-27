'use client';

import { useEffect, useRef, useState } from 'react';

const POSTER = '/images/ai-assets/ai-gym-hero.webp';

/**
 * Video hero dirender sebagai elemen terkendali: autoplay hanya aktif bila
 * pengguna tidak meminta gerak minimal, dan selalu tersedia tombol jeda.
 * Video berukuran besar dimuat dengan preload="none" agar poster tampil lebih
 * dulu dan kuota pengguna tidak terpakai sebelum diperlukan.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // Sumber kebenaran status adalah elemen video itu sendiri. Memakai hasil
  // promise play() saja bisa melenceng: promise bisa selesai tanpa pemutaran
  // benar-benar berjalan, sehingga label tombol tidak lagi sesuai kenyataan.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void video.play().catch(() => setPlaying(false));
    }

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        src="/videos/IMG_3125.mp4"
        poster={POSTER}
        muted
        loop
        playsInline
        preload="none"
        onLoadedData={() => setReady(true)}
        aria-label="Contoh tampilan sistem manajemen gym"
      />

      <button
        type="button"
        onClick={toggle}
        className="hero-art-toggle"
        aria-label={playing ? 'Jeda video' : 'Putar video'}
      >
        {playing ? 'Jeda' : 'Putar'}
      </button>

      {!ready ? <span className="sr-only">Video sedang dimuat.</span> : null}
    </>
  );
}
