import type { CSSProperties } from 'react';

import { fetchLanding } from '@/lib/server-api';
import DemoForm from '@/components/DemoForm';
import HeroVideo from '@/components/HeroVideo';
import Marquee from '@/components/Marquee';
import SiteChrome from '@/components/SiteChrome';
import { CONTACT_EMAIL, mailtoLink } from '@/lib/site';

export const dynamic = 'force-dynamic';

/* Mark resmi. Rasio asli 720:840, jadi berkas 96 px setara 82x96.
   Lebar/tinggi intrinsik diberikan agar tata letak tidak bergeser saat dimuat. */
const BRAND_MARK = {
  src: '/images/brand/logo-mark-96.webp',
  srcSet:
    '/images/brand/logo-mark-96.webp 1x, /images/brand/logo-mark-192.webp 2x, /images/brand/logo-mark-384.webp 3x',
  width: 82,
  height: 96,
} as const;

const BRAND_MARK_IMG = (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img
    className="brand-mark"
    src={BRAND_MARK.src}
    srcSet={BRAND_MARK.srcSet}
    width={BRAND_MARK.width}
    height={BRAND_MARK.height}
    alt=""
    decoding="async"
  />
);

const LEAKS = [
  {
    title: 'Sesi PT Tanpa Bukti',
    body: 'Kuota member terpotong, tetapi tidak ada catatan latihan, tanda tangan, maupun persetujuan manajer. Komisi tetap terbayar atas sesi yang tidak pernah tercatat.',
  },
  {
    title: 'Void Transaksi & Selisih Stok',
    body: 'Transaksi dihapus dari riwayat, stok tidak dikembalikan, dan kas harian tidak pernah cocok — tanpa nama operator yang bisa ditelusuri.',
  },
  {
    title: 'Prospek yang Berhenti di Chat Pribadi',
    body: 'Lead dari iklan berakhir di ponsel staf, tidak masuk basis data, lalu hilang tanpa status maupun bukti tindak lanjut.',
  },
  {
    title: 'Dokumen Keanggotaan Tercecer',
    body: 'Kuesioner kesehatan, perjanjian, dan program latihan ditandatangani di atas kertas, lalu tidak ditemukan saat dibutuhkan sebagai bukti.',
  },
];

const DOMAINS = [
  {
    num: '01',
    tag: 'CRM_ACQUISITION',
    title: 'CRM & Akuisisi',
    body: 'Basis data prospek dari iklan, kunjungan langsung, dan referral. Antrean follow-up harian, janji temu, status funnel, hingga konversi menjadi member — lengkap dengan bukti tindak lanjut.',
  },
  {
    num: '02',
    tag: 'MEMBER_LIFECYCLE',
    title: 'Keanggotaan & Front Office',
    body: 'Registrasi member dengan perhitungan prorate, biaya administrasi dari master paket, kuesioner kesehatan bertanda tangan digital, cicilan, cuti beku berbayar, sampai perpanjangan yang menyambung tanpa jeda.',
  },
  {
    num: '03',
    tag: 'PERSONAL_TRAINING',
    title: 'Personal Training',
    body: 'Direktori klien per trainer, log sesi dengan detail latihan dan tanda tangan ganda, kuota sesi, persetujuan manajer berjenjang, penilaian postur, serta papan peringkat konversi trainer.',
  },
  {
    num: '04',
    tag: 'POS_INVENTORY',
    title: 'Kasir & Inventaris',
    body: 'Penjualan paket, produk ritel, dan day-pass dari satu terminal. Pencegahan stok negatif dijalankan server, stok masuk dari distributor mencatat harga pokok, dan pembatalan transaksi mengembalikan stok secara otomatis.',
  },
  {
    num: '05',
    tag: 'FINANCE_PAYROLL',
    title: 'Keuangan & Payroll',
    body: 'Tiga pilar pendapatan, buku pengeluaran dengan foto nota, laba rugi bulanan, dan payroll komisi yang barisnya terkunci permanen begitu ditandai dibayar.',
  },
  {
    num: '06',
    tag: 'CLASS_SCHEDULE',
    title: 'Jadwal Kelas & Booking',
    body: 'Kalender kelas studio dengan kapasitas per ruangan dan deteksi bentrok jadwal instruktur. Kehadiran peserta langsung mengalir ke komisi pengajar tanpa rekap terpisah.',
  },
  {
    num: '07',
    tag: 'KIOSK_BIOMETRIC',
    title: 'Kiosk & Biometrik',
    body: 'Terminal kehadiran mandiri dengan wajah, kode QR, kartu, dan sidik jari. Verifikasi tetap berjalan saat koneksi putus, lalu antrean kehadirannya disinkronkan ulang setelah tersambung.',
  },
  {
    num: '08',
    tag: 'AI_POSTURE',
    title: 'Pemindai Postur AI',
    body: 'Pemindaian postur tiga dimensi dari tiga jepretan foto, mendeteksi forward head, asimetri bahu, kemiringan panggul, dan kelengkungan tulang belakang — lalu menyusun latihan korektif yang mengalir ke program latihan klien.',
  },
  {
    num: '09',
    tag: 'MASTER_AUDIT',
    title: 'Data Master & Audit',
    body: 'Paket, produk, promo, dan akun staf dengan delapan peran yang kewenangannya dipisah. Perubahan pada data prospek dan member tercatat pada riwayat aktivitas beserta identitas pelakunya.',
  },
];

const CONTROLS = [
  {
    num: 'I',
    title: 'Persetujuan Berjenjang',
    body: 'Sesi personal training pertama dan kedua wajib disetujui manajer. Izinnya terikat pada kombinasi member, paket, dan nomor sesi, sehingga tidak bisa dipakai ulang untuk sesi lain.',
  },
  {
    num: 'II',
    title: 'Tanda Tangan Ganda',
    body: 'Sesi baru dihitung ke kuota dan komisi setelah detail latihan, tanda tangan trainer, dan tanda tangan member lengkap. Dokumen keanggotaan mengikuti alur yang sama.',
  },
  {
    num: 'III',
    title: 'Bukti Sekali Pakai',
    body: 'Setiap verifikasi wajah menerbitkan token bukti berumur 30 detik yang terikat pada satu identitas dan langsung hangus saat dipakai. Hasil verifikasi tidak bisa diputar ulang.',
  },
  {
    num: 'IV',
    title: 'Atribusi & Riwayat',
    body: 'Setiap prospek dan member menyimpan riwayat aktivitasnya: operator, peran, jenis aksi, dan deskripsi lengkapnya — bisa disaring per tanggal dan diekspor. Penghapusan bersifat lunak, jadi data yang dihapus tetap bisa ditelusuri.',
  },
];

export default async function HomePage() {
  const { founders, partners } = await fetchLanding();

  return (
    <div className="shell">
      <SiteChrome />

      <div className="side-rail left" aria-hidden="true">
        <span className="rail-text">SMM · AIO · 2026</span>
      </div>
      <div className="side-rail right" aria-hidden="true">
        <span className="rail-text">AI Gym Management</span>
      </div>

      <div className="topbar">
        <div className="container wide">
          <div className="topbar-inner">
            <span>
              <b>PT Solusi Mitra Mandiri</b> · Divisi Sistem Kebugaran
            </span>
            <span className="mid">
              <span>
                <b className="coral">AIO</b> Platform
              </span>
            </span>
            <span className="right">
              <span className="right-status">
                <span className="pulse" aria-hidden="true" />
                Sistem Berjalan
              </span>
              <a className="topbar-link" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </span>
          </div>
        </div>
      </div>

      <header className="nav">
        <div className="container wide">
          <div className="nav-inner">
            <a className="brand" href="#top">
              {BRAND_MARK_IMG}
              <span className="brand-name">Solusi Mitra Mandiri</span>
              <span className="brand-meta">
                <b>AIO</b>
                AI Gym Management
              </span>
            </a>

            <nav aria-label="Navigasi utama">
              <ul className="nav-links">
                <li>
                  <a href="#masalah">
                    Masalah<span className="num">01</span>
                  </a>
                </li>
                <li>
                  <a href="#domain">
                    Domain<span className="num">02</span>
                  </a>
                </li>
                <li>
                  <a href="#kontrol">
                    Kontrol<span className="num">03</span>
                  </a>
                </li>
                <li>
                  <a href="#arsitektur">
                    Arsitektur<span className="num">04</span>
                  </a>
                </li>
                <li>
                  <a href="#mitra">
                    Mitra<span className="num">05</span>
                  </a>
                </li>
                <li>
                  <a href="#team">
                    Tim<span className="num">06</span>
                  </a>
                </li>
              </ul>
            </nav>

            <div className="nav-side">
              <span className="status-dot" aria-hidden="true" />
              <a className="nav-cta ghost" href="/admin/login">
                Portal Admin
              </a>
              <a className="nav-cta" href="#demo">
                Jadwalkan Demo
              </a>
            </div>
          </div>
        </div>
      </header>

      <main id="main">
        {/* I. HERO */}
        <section className="hero" id="top">
          <div className="container wide">
            <div className="sec-rule">
              <span className="roman">I.</span>
              <span className="meta-grp">
                <span>Manajemen Gym Berbasis AI</span>
                <span className="dot-mark">001 / 008</span>
              </span>
            </div>
          </div>

          <div className="container wide hero-grid">
            <div className="hero-copy">
              <span className="label">
                AIO Platform<span className="ix">/ AI Gym Management</span>
              </span>
              <h1 className="display">
                Dari prospek pertama sampai slip gaji trainer, dalam <em>satu</em> sistem
                <span className="dot">.</span>
              </h1>
              <p className="lead">
                AIO adalah sistem manajemen gym berbasis AI yang kami bangun untuk gym di Indonesia: akuisisi
                prospek, keanggotaan, kasir dan inventaris, jadwal kelas, sesi personal training, absensi
                biometrik, payroll komisi, dan laporan keuangan. Semuanya membaca basis data yang sama.
              </p>

              <div className="hero-actions">
                <a className="btn btn-primary" href="#demo">
                  Jadwalkan Demo
                  <span className="arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </a>
                <a
                  className="btn btn-ghost"
                  href={mailtoLink('Konsultasi teknis AIO — sistem manajemen gym')}
                >
                  Konsultasi Teknis
                </a>
              </div>

              <div className="hero-stats">
                <span className="stat">
                  <span className="ring coral" aria-hidden="true">
                    8
                  </span>
                  <span className="stat-label">
                    <b>Peran Akses</b>
                    Kewenangan dipisah
                  </span>
                </span>
              </div>
            </div>

            <div className="hero-art">
              <span className="corner tl" aria-hidden="true" />
              <span className="corner tr" aria-hidden="true" />
              <span className="corner bl" aria-hidden="true" />
              <span className="corner br" aria-hidden="true" />
              <span className="annot annot-tl">Animasi Identitas AIO</span>
              <span className="annot annot-br coord">2.98°S 104.75°E</span>
              <HeroVideo />
            </div>
          </div>

          <div className="container wide">
            <div className="hero-foot">
              <span className="meta">
                Produk berjalan di gym mitra · Basis data tunggal
              </span>
              <span className="meta">
                Riwayat aktivitas per member · Tanda tangan digital tersimpan per dokumen
              </span>
            </div>
          </div>
        </section>

        <Marquee />

        {/* II. MASALAH */}
        <section id="masalah">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">II.</span>
              <span className="meta-grp">
                <span>Diagnosa Kebocoran Operasional</span>
                <span className="dot-mark">002 / 008</span>
              </span>
            </div>

            <div className="about-grid">
              <div className="about">
                <span className="label">
                  Akar Masalah<span className="ix">/ Analisis</span>
                </span>
                <h2 className="display">
                  Kebocoran operasional jarang muncul sebagai satu baris kerugian
                  <span className="dot">.</span>
                </h2>
                <p className="lead">
                  Ia muncul sebagai selisih kecil yang berulang setiap hari: kuota sesi yang terpotong tanpa
                  catatan, transaksi yang dibatalkan tanpa jejak, prospek yang berhenti di ponsel pribadi staf.
                  AIO dibangun untuk menutup keempat titik itu dengan aturan yang dijalankan server, bukan
                  dengan disiplin manual.
                </p>
                <div className="footer-row">
                  <span className="mark" aria-hidden="true">
                    A
                  </span>
                  <span>Empat titik kebocoran yang kami tangani</span>
                  <span className="stamp">
                    <span>Penegakan aturan</span>
                    <span>Di sisi server</span>
                  </span>
                </div>
              </div>

              <div className="cards" style={{ gridTemplateColumns: '1fr', marginTop: 0 }}>
                {LEAKS.map((leak) => (
                  <article className="card" key={leak.title} data-reveal="">
                    <h3>{leak.title}</h3>
                    <p>{leak.body}</p>
                    <div className="card-foot">
                      <span className="meta">Titik Kebocoran</span>
                      <span className="arrow-mark" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* III. DOMAIN */}
        <section id="domain">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">III.</span>
              <span className="meta-grp">
                <span>Sembilan Domain Operasional</span>
                <span className="dot-mark">003 / 008</span>
              </span>
            </div>

            <div className="section-header">
              <span className="label">
                Kapabilitas<span className="ix">/ Sembilan Domain</span>
              </span>
              <h2 className="display">
                Setiap peran di gym punya satu tempat kerja di sistem yang sama
                <span className="dot">.</span>
              </h2>
              <p className="lead">
                AIO disusun sebagai monolit modular: dua belas modul domain di balik satu basis data, dengan
                hak akses yang dipisah per peran dan riwayat aktivitas yang menempel pada tiap prospek maupun
                member.
              </p>
            </div>

            {/* Tumpukan kartu: tiap kartu dipaku pada offset bertingkat, jadi
                kartu berikutnya menutupi kartu sebelumnya dan menyisakan tepi
                atasnya. --i dipakai CSS untuk menghitung offset dan langkah.
                Reveal hanya dipasang di wadah: kartu yang sudah tertutup tidak
                lagi mencapai ambang 12% tinggi elemen milik SiteChrome, jadi
                reveal per kartu akan meninggalkannya transparan. */}
            <div className="card-stack" data-reveal="">
              {DOMAINS.map((domain, index) => (
                <article
                  className="card card-stack-item"
                  key={domain.tag}
                  style={{ '--i': index } as CSSProperties}
                >
                  <div className="num">
                    {domain.num}
                    <span className="tag">{domain.tag}</span>
                  </div>
                  <h3>{domain.title}</h3>
                  <p>{domain.body}</p>
                  <div className="card-foot">
                    <span className="meta">Modul Aktif</span>
                    <span className="arrow-mark" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* IV. KONTROL */}
        <section id="kontrol">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">IV.</span>
              <span className="meta-grp">
                <span>Mekanisme Penegakan</span>
                <span className="dot-mark">004 / 008</span>
              </span>
            </div>

            <div className="section-header">
              <span className="label">
                Kontrol<span className="ix">/ Empat Lapis</span>
              </span>
              <h2 className="display">
                Aturan yang dijalankan server, bukan imbauan di grup chat
                <span className="dot">.</span>
              </h2>
              <p className="lead">
                Empat mekanisme berikut yang membedakan pencatatan biasa dari pengendalian. Semuanya berjalan di
                sisi backend — staf tidak bisa melewatinya lewat antarmuka.
              </p>
            </div>

            <div className="method-grid">
              {CONTROLS.map((step) => (
                <div className="method-step" key={step.num} data-reveal="">
                  <div className="num">{step.num}</div>
                  <h4>{step.title}</h4>
                  <p>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* V. ARSITEKTUR */}
        <section id="arsitektur">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">V.</span>
              <span className="meta-grp">
                <span>Arsitektur &amp; Rekayasa</span>
                <span className="dot-mark">005 / 008</span>
              </span>
            </div>

            <div className="section-header">
              <span className="label">
                Arsitektur<span className="ix">/ Monolit Modular</span>
              </span>
              <h2 className="display">
                Dibangun untuk dirawat bertahun-tahun, bukan untuk demo
                <span className="dot">.</span>
              </h2>
              <p className="lead">
                Satu basis data relasional, satu aplikasi web, satu aplikasi kiosk. Tidak ada layanan mikro yang
                harus dijaga terpisah, sehingga instalasi di lokasi klien tetap bisa dikelola tim kecil. Seluruh
                domain dibungkus tes otomatis dan migrasi skema yang bisa dijalankan ulang.
              </p>
            </div>
          </div>
        </section>

        {/* VI. MITRA */}
        <section id="mitra">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">VI.</span>
              <span className="meta-grp">
                <span>Jaringan Mitra</span>
                <span className="dot-mark">006 / 008</span>
              </span>
            </div>

            {partners.length > 0 ? (
              <div className="partners-block">
                <h2 className="label">
                  Mitra Gym<span className="ix">/ Terpasang</span>
                </h2>
                <div className="partners-grid">
                  {partners.map((partner) => (
                    <div className="partner-plate" key={partner.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={partner.logo_path} alt={`Logo ${partner.name}`} loading="lazy" />
                      <span>{partner.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>
                  Belum ada logo mitra yang diterbitkan. Unggah logo dari portal admin, lalu segarkan halaman ini.
                </p>
                <a className="btn btn-ghost btn-sm" href="/admin/login" style={{ marginTop: 18 }}>
                  Buka Portal Admin
                </a>
              </div>
            )}
          </div>
        </section>

        {/* VII. TEAM */}
        <section className="tight" id="team">
          <div className="work">
            <div className="work-rule">
              <span className="roman">VII.</span>
              <span>Kepemimpinan · Tim Produk &amp; Teknologi</span>
              <span>007 / 008</span>
            </div>

            <div className="work-grid">
              {founders.map((founder) => (
                <article className="work-card" key={founder.id} data-reveal="">
                  {founder.image_path ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img className="portrait" src={founder.image_path} alt={founder.name} loading="lazy" />
                  ) : null}
                  <span className="role-badge">{founder.role}</span>
                  <h3>{founder.name}</h3>
                  <p>{founder.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* VIII. DEMO */}
        <section id="demo">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">VIII.</span>
              <span className="meta-grp">
                <span>Permintaan Demo</span>
                <span className="dot-mark">008 / 008</span>
              </span>
            </div>

            <div className="cta-plate">
              <span className="label">
                Langkah Berikutnya<span className="ix">/ 30 Menit</span>
              </span>
              <h2 className="display" style={{ fontSize: 'clamp(30px, 3.6vw, 48px)', margin: '20px 0 16px' }}>
                Lihat AIO berjalan dengan data gym Anda<span className="dot">.</span>
              </h2>
              <p className="lead">
                Sesi demo berlangsung 30 menit bersama tim implementasi. Kami memetakan alur operasional Anda,
                menunjukkan modul yang paling cepat menutup kebocoran, lalu menyusun rencana migrasi data yang
                sudah Anda miliki.
              </p>

              <DemoForm />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="#top">
                {BRAND_MARK_IMG}
                <span className="brand-name">Solusi Mitra Mandiri</span>
              </a>
              <p>
                Perusahaan teknologi yang membangun sistem operasi gym untuk industri kebugaran Indonesia.
                AIO adalah produknya.
              </p>
            </div>

            <div className="foot-col">
              <h5>Produk</h5>
              <ul>
                <li>
                  <a href="#domain">Domain Operasional</a>
                </li>
                <li>
                  <a href="#kontrol">Kontrol &amp; Audit</a>
                </li>
                <li>
                  <a href="#arsitektur">Arsitektur</a>
                </li>
              </ul>
            </div>

            <div className="foot-col">
              <h5>Perusahaan</h5>
              <ul>
                <li>
                  <a href="#masalah">Diagnosa Operasional</a>
                </li>
                <li>
                  <a href="#mitra">Mitra Gym</a>
                </li>
                <li>
                  <a href="#team">Kepemimpinan</a>
                </li>
              </ul>
            </div>

            <div className="foot-col">
              <h5>Kontak</h5>
              <ul>
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </li>
                <li>
                  <a href="/admin/login">Portal Admin</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© 2026 PT Solusi Mitra Mandiri</span>
            <span>Indonesia</span>
          </div>

          <div className="foot-mega" aria-hidden="true">
            <div className="word">
              AI<em> Gym Management.</em>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
