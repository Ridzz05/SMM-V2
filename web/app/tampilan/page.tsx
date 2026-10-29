import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ProductShot from '@/components/ProductShot';
import { Reveal } from '@/components/motion/Reveal';
import { SplitHeadline } from '@/components/motion/SplitHeadline';
import { DESKTOP_SHOT, MOBILE_SHOT } from '@/lib/produk';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Tampilan sistem manajemen gym',
  description:
    'Tangkapan layar asli dasbor BossQueen ERP pada layar desktop dan ponsel, dengan keterangan tiap elemen: sidebar modul, status keanggotaan, kunjungan harian, dan pintasan kiosk.',
  alternates: { canonical: '/tampilan' },
  openGraph: {
    title: 'Tampilan sistem manajemen gym | PT Solusi Mitra Mandiri',
    description:
      'Tangkapan layar asli dasbor sistem pada layar desktop dan ponsel, dengan keterangan tiap elemen.',
    url: `${SITE_URL}/tampilan`,
  },
};

export default function TampilanPage() {
  return (
    <>
      <Navbar variant="page" />

      <main id="main">
        <section className="section page-head">
          <div className="wrap">
            <p className="eyebrow">Di dalam sistem</p>
            <SplitHeadline as="h1" className="page-title">
              Tampilan asli, bukan gambar rancangan.
            </SplitHeadline>
            <p className="lede">
              Dua tangkapan layar di bawah diambil dari sistem yang berjalan dengan data uji. Nomor pada
              gambar menunjuk elemen yang sama pada daftar keterangan di bawahnya.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="shots">
              <Reveal>
                <ProductShot shot={DESKTOP_SHOT} variant="wide" />
              </Reveal>
              <Reveal>
                <ProductShot shot={MOBILE_SHOT} variant="tall" />
              </Reveal>
            </div>

            <Reveal className="page-cta">
              <div>
                <h2>Lihat sistemnya bekerja pada data gym Anda.</h2>
                <p>Sesi 30 menit daring, tanpa biaya, memakai data gym Anda sebagai contoh.</p>
              </div>
              <div className="page-cta-actions">
                <a className="btn" href="/#demo">
                  Jadwalkan demo
                </a>
                <a className="btn btn-quiet" href="/">
                  Kembali ke beranda
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
