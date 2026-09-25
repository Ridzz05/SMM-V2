import { fetchLanding } from '@/lib/server-api';
import DemoForm from '@/components/DemoForm';
import HeroVideo from '@/components/HeroVideo';
import Navbar from '@/components/Navbar';
import { CONTACT_EMAIL, mailtoLink } from '@/lib/site';
export const dynamic = 'force-dynamic';

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
    alt="Logo PT Solusi Mitra Mandiri"
    decoding="async"
  />
);

const LEAKS = [
  {
    title: 'Klaim Sesi PT Fiktif & Pemotongan Tanpa Bukti',
    body: 'Kuota member terpotong dan komisi trainer terbayar atas sesi yang tidak pernah terlaksana di lapangan. Sistem All-In-One (AIO) mewajibkan verifikasi wajah dua arah di kiosk, tanda tangan digital ganda, serta otorisasi manajer untuk sesi pembuka.',
  },
  {
    title: 'Void Kasir Ilegal & Selisih Stok Ritel',
    body: 'Kasir membatalkan nota transaksi tanpa jejak dan stok barang tidak kembali ke gudang. Sistem All-In-One mengunci hak tombol Void khusus untuk level manajer dengan catatan alasan tertulis, perlindungan stok negatif, dan audit trail otomatis.',
  },
  {
    title: 'Prospek Menguap di Ponsel Pribadi Sales',
    body: 'Leads dari iklan berbayar (TikTok, IG Ads) hilang di percakapan WhatsApp pribadi staf tanpa riwayat follow-up. Sistem All-In-One mewajibkan unggah bukti screenshot untuk status gagal dihubungi serta mengotomasi Service Call retensi berkala.',
  },
  {
    title: 'Dokumen Perjanjian & Kuesioner Medis Tercecer',
    body: 'Formulir kesehatan PAR-Q, kontak darurat, dan PT Agreement ditandatangani di atas kertas fisik yang rawan hilang saat terjadi sengketa hukum atau cedera. Sistem All-In-One menyimpan tanda tangan kanvas digital member dan manajer per dokumen.',
  },
];

const DOMAINS = [
  {
    num: '01',
    tag: 'CRM & Prospek',
    title: 'CRM & Membership Consultant (MC)',
    body: 'Pelacakan efektivitas kanal promosi (TikTok, Ads, Walk-In), antrean follow-up harian wajib bukti foto/chat, formulir tamu walk-in kilat, serta Service Call retensi berkala (Day 7, 14, 21) untuk mencegah churn member baru.',
  },
  {
    num: '02',
    tag: 'Front Desk',
    title: 'Operasional & Customer Service (CS)',
    body: 'Pendaftaran keanggotaan dengan kalkulasi prorate, biaya admin dinamis, kontak darurat wajib, penerbitan kontrak resmi PT Agreement, pembayaran cicilan tagihan bertahap, dan rekapitulasi kehadiran kelas studio.',
  },
  {
    num: '03',
    tag: 'Personal Training',
    title: 'Personal Training (PT) Management',
    body: 'Pemisahan klien aktif vs riwayat, log harian latihan (beban kg, repetisi, notes) bertanda tangan ganda, otorisasi sesi 1 & 2 oleh manajer, Gym Orientation gratis, jadwal kalender TAS, serta AI Workout & Meal Planner.',
  },
  {
    num: '04',
    tag: 'Direktori Member',
    title: 'Member Directory & Dokumen Kontrak',
    body: 'Database anggota terpusat dengan profil 360 derajat, pembekuan cuti/freeze granular (gym saja, PT saja, atau keduanya) dengan perpanjangan masa aktif otomatis, renewal instan, dan cetak ulang arsip PAR-Q digital.',
  },
  {
    num: '05',
    tag: 'Kasir & Stok',
    title: 'Kasir POS & Inventaris Ritel Toko',
    body: 'Terminal kasir cepat untuk suplemen, minuman, merchandise, dan tiket harian barcode. Dilengkapi pencegahan stok negatif di level database, pencatatan stok masuk inbound dengan HPP distributor, dan void terkunci izin manajer.',
  },
  {
    num: '06',
    tag: 'Finance & Gaji',
    title: 'Finance, Payroll & Laporan Eksekutif',
    body: 'Executive summary pendapatan 3 pilar (Membership, PT, POS), pemisahan pajak NJM/PPN, kalkulator payroll otomatis untuk komisi sesi PT dan bonus renewal CS, buku pengeluaran kas dengan foto nota, serta neraca P&L bulanan.',
  },
  {
    num: '07',
    tag: 'Kelas Studio',
    title: 'Jadwal Kelas Studio & Reservasi Booking',
    body: 'Kalender mingguan interaktif kelas studio (Yoga, Zumba, Pilates, Spinning) dengan deteksi bentrok instruktur/ruangan, sistem kuota booking member, wewenang override tarif tiket harian oleh CS, dan rekap honor instruktur.',
  },
  {
    num: '08',
    tag: 'Kiosk & AI',
    title: 'Kiosk Mandiri, Turnstile & AI Scanner',
    body: 'Aplikasi terminal mandiri dengan engine IndexedDB offline-first (respons sub-5ms) dan proteksi anti-passback. Sesi privat PT wajib verifikasi biometrik wajah 2-arah (barcode ditolak), serta pemindaian postur tubuh 3D MediaPipe.',
  },
  {
    num: '09',
    tag: 'Master & Audit',
    title: 'Data Master & Konfigurasi Sistem',
    body: 'Pengaturan paket langganan dan biaya admin fleksibel, manajemen karyawan 8 tingkat peran tanpa akun bersama (shared login), presensi mandiri geofence GPS staf, dan log aktivitas sistem immutable write-only.',
  },
];

const CONTROLS = [
  {
    num: '01',
    title: 'Otorisasi Manajer Sesi Pembuka',
    body: 'Sesi PT pertama dan kedua wajib diverifikasi checklist kelayakannya oleh manajer di sistem. Sesi lanjutan diblokir otomatis oleh server jika formulir kesehatan PAR-Q dan program latihan belum ditandatangani digital.',
  },
  {
    num: '02',
    title: 'Tanda Tangan Kanvas Digital Resmi',
    body: 'Setiap perjanjian keanggotaan, formulir medis PAR-Q, dan persetujuan program latihan mewajibkan tanda tangan digital kanvas member dan manajer yang tersimpan permanen di database tanpa celah dokumen tercecer.',
  },
  {
    num: '03',
    title: 'Verifikasi Biometrik Wajah Dua Arah',
    body: 'Terminal kiosk menolak kartu barcode untuk sesi PT. Trainer dan member wajib memindai wajah langsung di depan kamera secara bergiliran guna memastikan sesi latihan tatap muka benar-benar terjadi di gym.',
  },
  {
    num: '04',
    title: 'Wewenang Terkunci & Audit Trail Permanen',
    body: 'Pembatalan transaksi kasir (Void) hanya dapat dieksekusi dengan otorisasi manajer. Staf sales wajib melampirkan screenshot untuk status prospek gagal, dan setiap mutasi terekam pada log sistem yang tidak dapat diubah.',
  },
];

export default async function HomePage() {
  const { founders, partners } = await fetchLanding();

  return (
    <div className="shell">
      {/* Navigasi Utama */}
      <Navbar brandMarkImg={BRAND_MARK_IMG} />

      <main id="main">
        {/* I. HERO */}
        <section className="section hero" id="top">
          <div className="container wide">
            <div className="hero-grid">
              <div className="hero-copy">
                <span className="hero-badge">Sistem Operasi Gym Enterprise All-In-One (AIO) · PT Solusi Mitra Mandiri</span>
                <h1 className="hero-headline">
                  Satu sistem operasi untuk <em>seluruh</em> alur bisnis gym Anda.
                </h1>
                <p className="hero-desc">
                  Sistem All-In-One (AIO) dari PT Solusi Mitra Mandiri menghubungkan meja resepsionis,
                  konsultan keanggotaan (MC), personal trainer, kasir POS, turnstile gate biometrik, dan
                  akuntansi dalam satu basis data terintegrasi, dengan penegakan 35 standar operasional (SOP)
                  langsung dari sisi server.
                </p>

                <div className="hero-actions">
                  <a className="btn btn-primary" href="#demo">
                    Jadwalkan Demo
                  </a>
                  <a
                    className="btn btn-ghost"
                    href={mailtoLink('Konsultasi teknis sistem All-In-One: PT Solusi Mitra Mandiri')}
                  >
                    Konsultasi Teknis
                  </a>
                </div>

                <div className="hero-meta">
                  <span className="hero-meta-item">
                    <span className="hero-meta-dot" />
                    Turnstile gate sub-5ms offline-first
                  </span>
                  <span className="hero-meta-item">
                    <span className="hero-meta-dot" />
                    Biometrik wajah 2-arah sesi PT
                  </span>
                  <span className="hero-meta-item">
                    <span className="hero-meta-dot" />
                    Tanda tangan kanvas digital per dokumen
                  </span>
                  <span className="hero-meta-item">
                    <span className="hero-meta-dot" />
                    Payroll komisi otomatis satu klik
                  </span>
                </div>
              </div>

              <div className="hero-art">
                <HeroVideo />
              </div>
            </div>
          </div>
        </section>

        {/* II. MASALAH OPERASIONAL */}
        <section className="section" id="masalah">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Diagnosa Lapangan</span>
              <h2 className="section-title">Menutup 4 Titik Kebocoran Finansial &amp; Operasional Gym.</h2>
              <p className="section-desc">
                Kebocoran operasional gym paling sering terjadi pada celah pencatatan manual dan ketiadaan validasi
                sistem. Sistem All-In-One (AIO) PT Solusi Mitra Mandiri mengunci celah tersebut melalui aturan backend yang tidak bisa dilewati staf di lapangan.
              </p>
            </div>

            <div className="problems-grid">
              {LEAKS.map((leak, idx) => (
                <article className="problem-card" key={leak.title}>
                  <span className="problem-num">0{idx + 1} / Celah Operasional</span>
                  <h3>{leak.title}</h3>
                  <p>{leak.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* III. DOMAIN / FITUR OPERASIONAL */}
        <section className="section" id="domain">
          <div className="container">
            <div className="section-header">
              <span className="section-tag blue">Katalog Fitur Lengkap</span>
              <h2 className="section-title">9 Pilar Domain Operasional Tanpa Silo Data.</h2>
              <p className="section-desc">
                Arsitektur modular monolith dengan basis data relasional tunggal. Seluruh divisi bekerja pada data
                yang sama secara real-time tanpa perlu sinkronisasi berkas manual.
              </p>
            </div>

            <div className="domains-grid">
              {DOMAINS.map((domain) => (
                <article className="domain-card" key={domain.num}>
                  <div className="domain-top">
                    <span className="domain-num">{domain.num}</span>
                    <span className="domain-badge">{domain.tag}</span>
                  </div>
                  <h3>{domain.title}</h3>
                  <p>{domain.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* IV. KONTROL & INTEGRITAS */}
        <section className="section" id="kontrol">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Validasi Sisi Server</span>
              <h2 className="section-title">Aturan Bisnis yang Ditegakkan Sistem, Bukan Imbauan.</h2>
              <p className="section-desc">
                Pencatatan manual mudah dimanipulasi. Sistem All-In-One (AIO) menanamkan 35 Standar Operasional Prosedur (SOP) langsung
                ke dalam logika transaksi server guna memastikan integritas pendapatan dan data member.
              </p>
            </div>

            <div className="controls-grid">
              {CONTROLS.map((ctrl) => (
                <div className="control-card" key={ctrl.num}>
                  <div className="control-num">{ctrl.num}</div>
                  <h4>{ctrl.title}</h4>
                  <p>{ctrl.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* V. JARINGAN MITRA GYM */}
        <section className="section" id="mitra">
          <div className="container">
            <div className="section-header center">
              <span className="section-tag blue">Jaringan Operasional</span>
              <h2 className="section-title">Dipercaya oleh Studio &amp; Pusat Kebugaran Mitra.</h2>
              <p className="section-desc">
                Sistem All-In-One (AIO) PT Solusi Mitra Mandiri telah beroperasi melayani manajemen harian pada jaringan gym dan studio kebugaran mitra
                di Indonesia.
              </p>
            </div>

            {partners.length > 0 ? (
              <div className="partners-grid">
                {partners.map((partner) => (
                  <div className="partner-plate" key={partner.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={partner.logo_path} alt={`Logo ${partner.name}`} loading="lazy" />
                    <span>{partner.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Belum ada logo mitra yang diterbitkan.</p>
              </div>
            )}
          </div>
        </section>

        {/* VI. TIM FOUNDER */}
        <section className="section" id="team">
          <div className="container">
            <div className="section-header center">
              <span className="section-tag">Kepemimpinan</span>
              <h2 className="section-title">Tim Produk &amp; Rekayasa Sistem.</h2>
              <p className="section-desc">
                PT Solusi Mitra Mandiri didirikan oleh praktisi rekayasa perangkat lunak dan manajemen kebugaran
                yang merancang sistem dari kebutuhan lapangan nyata.
              </p>
            </div>

            <div className="founders-grid">
              {founders.map((founder) => (
                <article className="founder-card" key={founder.id}>
                  {founder.image_path ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      className="founder-portrait"
                      src={founder.image_path}
                      alt={founder.name}
                      loading="lazy"
                    />
                  ) : null}
                  <span className="founder-role">{founder.role}</span>
                  <h3>{founder.name}</h3>
                  <p>{founder.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* VII. PERMINTAAN DEMO */}
        <section className="section" id="demo">
          <div className="container narrow">
            <div className="demo-card">
              <div className="section-header center" style={{ marginBottom: 32 }}>
                <span className="section-tag">Konsultasi Implementasi</span>
                <h2 className="section-title">Jadwalkan Konsultasi &amp; Demonstrasi Sistem.</h2>
                <p className="section-desc">
                  Sesi 30 menit bersama tim implementasi PT Solusi Mitra Mandiri untuk memetakan alur kerja gym Anda
                  dan mendemonstrasikan bagaimana 35 SOP diterapkan langsung pada sistem All-In-One (AIO).
                </p>
              </div>

              <DemoForm />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="#top">
                {BRAND_MARK_IMG}
                <span className="brand-name">Solusi Mitra Mandiri</span>
              </a>
              <p>
                PT Solusi Mitra Mandiri adalah perusahaan teknologi pengembang sistem All-In-One (AIO): platform
                operasional gym terpadu, kasir POS, turnstile gate biometrik, dan akuntansi kebugaran di Indonesia.
              </p>
            </div>

            <div className="foot-col">
              <h5>Solusi Sistem</h5>
              <ul>
                <li>
                  <a href="#domain">9 Pilar Modul Domain</a>
                </li>
                <li>
                  <a href="#kontrol">Penegakan 35 SOP Server</a>
                </li>
                <li>
                  <a href="#masalah">Diagnosa Kebocoran Gym</a>
                </li>
              </ul>
            </div>

            <div className="foot-col">
              <h5>Divisi Utama</h5>
              <ul>
                <li>
                  <a href="#domain">CRM &amp; Front Desk CS</a>
                </li>
                <li>
                  <a href="#domain">Personal Training &amp; Kiosk</a>
                </li>
                <li>
                  <a href="#domain">Kasir POS &amp; Payroll Gaji</a>
                </li>
              </ul>
            </div>

            <div className="foot-col">
              <h5>Akses &amp; Kontak</h5>
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
            <span>&copy; 2026 PT Solusi Mitra Mandiri. Seluruh hak cipta dilindungi undang-undang.</span>
            <span>Indonesia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
