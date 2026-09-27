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
    title: 'Sesi personal trainer yang tidak pernah terjadi, tapi tetap dibayar',
    body: 'Kuota member berkurang dan komisi trainer dibayar untuk sesi latihan yang sebenarnya tidak ada di lapangan. Di sistem ini, setiap sesi personal trainer wajib diverifikasi lewat pemindaian wajah trainer dan member di mesin depan pintu, ditandatangani dua pihak, dan sesi pertama harus disetujui manajer.',
  },
  {
    title: 'Transaksi dibatalkan sembarangan, stok barang jadi tidak cocok',
    body: 'Kasir bisa membatalkan nota tanpa jejak, dan barang yang batal tidak kembali ke catatan stok. Sistem ini mengunci tombol batal hanya untuk manajer, mewajibkan alasan tertulis, mencegah stok minus, dan mencatat semua perubahan.',
  },
  {
    title: 'Calon member hilang di HP pribadi staf',
    body: 'Calon member dari iklan TikTok atau Instagram sering hanya disimpan di WhatsApp pribadi staf, lalu terlupakan. Sistem ini mewajibkan bukti screenshot untuk calon member yang tidak bisa dihubungi, dan mengingatkan staf menghubungi ulang di hari ke-7, 14, dan 21.',
  },
  {
    title: 'Surat perjanjian dan riwayat kesehatan hilang saat dibutuhkan',
    body: 'Formulir kesehatan, kontak darurat, dan perjanjian personal trainer masih ditandatangani di kertas, sehingga mudah hilang saat ada sengketa atau cedera. Sistem ini menyimpan tanda tangan digital member dan manajer untuk setiap dokumen.',
  },
];

const DOMAINS = [
  {
    num: '01',
    tag: 'Calon Member',
    title: 'Pencarian & Pendaftaran Member',
    body: 'Mencatat calon member datang dari mana (TikTok, iklan, atau datang langsung), daftar harian siapa yang harus dihubungi beserta bukti chat, formulir cepat untuk tamu yang datang langsung, dan pengingat menghubungi member baru supaya tidak berhenti berlangganan.',
  },
  {
    num: '02',
    tag: 'Meja Depan',
    title: 'Pelayanan Harian di Meja Depan',
    body: 'Pendaftaran member dengan hitungan harga otomatis, biaya admin yang bisa diatur, kontak darurat wajib diisi, cetak perjanjian resmi, pembayaran cicilan, dan rekap kehadiran kelas.',
  },
  {
    num: '03',
    tag: 'Personal Trainer',
    title: 'Pengelolaan Sesi Personal Trainer',
    body: 'Memisahkan member yang masih aktif dari yang sudah selesai, catatan latihan harian (beban, repetisi, catatan) yang ditandatangani dua pihak, sesi pertama dan kedua harus disetujui manajer, sesi perkenalan gratis, jadwal kalender trainer, serta saran latihan dan menu makan.',
  },
  {
    num: '04',
    tag: 'Data Member',
    title: 'Data Lengkap Member & Perjanjian',
    body: 'Semua data member tersimpan di satu tempat, lengkap dengan riwayatnya. Keanggotaan bisa dihentikan sementara (gym saja, personal trainer saja, atau keduanya), langganan bisa diperpanjang otomatis maupun sekali klik, dan formulir kesehatan bisa dicetak ulang.',
  },
  {
    num: '05',
    tag: 'Kasir & Barang',
    title: 'Kasir Toko & Stok Barang',
    body: 'Kasir cepat untuk suplemen, minuman, peralatan gym, dan tiket harian. Stok tidak bisa minus, pencatatan barang masuk lengkap dengan harga dari distributor, dan pembatalan transaksi hanya bisa dilakukan manajer.',
  },
  {
    num: '06',
    tag: 'Keuangan & Gaji',
    title: 'Laporan Keuangan & Gaji Karyawan',
    body: 'Ringkasan pemasukan dari tiga sumber (keanggotaan, personal trainer, toko), pajak dihitung terpisah, hitung otomatis komisi trainer dan bonus staf meja depan, catatan pengeluaran dengan foto nota, serta laporan laba rugi bulanan.',
  },
  {
    num: '07',
    tag: 'Kelas',
    title: 'Jadwal Kelas & Pemesanan Tempat',
    body: 'Jadwal kelas mingguan (Yoga, Zumba, Pilates, Spinning) yang otomatis mencegah jadwal bentrok antar instruktur atau ruangan, kuota peserta, harga tiket harian yang bisa diubah staf meja depan, dan rekap honor instruktur.',
  },
  {
    num: '08',
    tag: 'Pintu Masuk',
    title: 'Mesin Masuk Mandiri, Pintu Otomatis & Pemindai',
    body: 'Layar mandiri di depan pintu yang tetap berfungsi walau internet mati, dan mencegah satu kartu dipakai dua orang. Sesi personal trainer wajib verifikasi wajah trainer dan member, serta pemindaian postur tubuh.',
  },
  {
    num: '09',
    tag: 'Pengaturan',
    title: 'Pengaturan Sistem & Riwayat Aktivitas',
    body: 'Mengatur paket langganan dan biaya admin, mengelola karyawan dengan 8 tingkat wewenang tanpa akun bersama, absensi staf dengan lokasi GPS, dan catatan semua aktivitas yang tidak bisa dihapus.',
  },
];

const CONTROLS = [
  {
    num: '01',
    title: 'Sesi personal trainer pertama wajib disetujui manajer',
    body: 'Sesi personal trainer pertama dan kedua harus diperiksa dan disetujui manajer lewat sistem. Sesi berikutnya otomatis diblokir kalau formulir kesehatan dan program latihan belum ditandatangani.',
  },
  {
    num: '02',
    title: 'Tanda tangan digital yang tersimpan permanen',
    body: 'Setiap perjanjian keanggotaan, formulir kesehatan, dan persetujuan program latihan wajib ditandatangani member dan manajer di layar. Semuanya tersimpan di sistem, tidak ada lagi berkas kertas yang bisa hilang.',
  },
  {
    num: '03',
    title: 'Sesi personal trainer diverifikasi lewat wajah',
    body: 'Kartu tidak bisa dipakai untuk sesi personal trainer. Trainer dan member harus memindai wajah di depan kamera secara bergantian, supaya sesi yang tercatat benar-benar terjadi di gym.',
  },
  {
    num: '04',
    title: 'Pembatalan hanya oleh manajer, semuanya tercatat',
    body: 'Transaksi kasir hanya bisa dibatalkan manajer. Staf penjualan wajib melampirkan screenshot untuk calon member yang gagal dihubungi, dan setiap perubahan tercatat di riwayat yang tidak bisa diubah.',
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
                <h1 className="hero-headline">
                  Semua urusan gym Anda, <em>satu</em> sistem saja.
                </h1>
                <p className="hero-desc">
                  PT Solusi Mitra Mandiri menyatukan semua bagian gym Anda (meja depan, penjualan
                  keanggotaan, personal trainer, kasir, pintu masuk, sampai laporan keuangan) ke dalam
                  satu sistem. Semua divisi membaca data yang sama, dan aturan mainnya dijaga otomatis
                  oleh sistem, bukan bergantung pada kedisiplinan staf.
                </p>

                <div className="hero-actions">
                  <a className="btn btn-primary" href="#demo">
                    Jadwalkan Demo
                  </a>
                  <a
                    className="btn btn-ghost"
                    href={mailtoLink('Konsultasi sistem manajemen gym: PT Solusi Mitra Mandiri')}
                  >
                    Tanya Dulu
                  </a>
                </div>

                <div className="hero-meta">
                  <span className="hero-meta-item">
                    <span className="hero-meta-dot" />
                    Pintu masuk tetap jalan walau internet mati
                  </span>
                  <span className="hero-meta-item">
                    <span className="hero-meta-dot" />
                    Sesi personal trainer diverifikasi lewat wajah
                  </span>
                  <span className="hero-meta-item">
                    <span className="hero-meta-dot" />
                    Semua perjanjian ditandatangani di layar
                  </span>
                  <span className="hero-meta-item">
                    <span className="hero-meta-dot" />
                    Gaji dan komisi dihitung otomatis
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
              <span className="section-tag">Masalah yang Sering Terjadi</span>
              <h2 className="section-title">Empat kebocoran yang paling sering menguras gym.</h2>
              <p className="section-desc">
                Uang dan data paling sering hilang bukan karena staf berniat buruk, tetapi karena pencatatan
                masih manual dan tidak ada yang memeriksa. Sistem ini menutup celah tersebut dengan aturan
                yang tidak bisa dilewati staf di lapangan.
              </p>
            </div>

            <div className="problems-grid">
              {LEAKS.map((leak, idx) => (
                <article className="problem-card" key={leak.title}>
                  <span className="problem-num">Masalah 0{idx + 1}</span>
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
              <span className="section-tag blue">Fitur Lengkap</span>
              <h2 className="section-title">Sembilan bagian, semuanya tersambung.</h2>
              <p className="section-desc">
                Setiap divisi di gym Anda punya modulnya sendiri, tetapi semuanya membaca data yang sama.
                Tidak ada lagi laporan yang harus disalin ulang dari satu aplikasi ke aplikasi lain.
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
              <span className="section-tag">Aturan yang Dijaga Sistem</span>
              <h2 className="section-title">Aturan yang dipaksa sistem, bukan sekadar imbauan.</h2>
              <p className="section-desc">
                Catatan manual gampang diubah orang. Sistem ini menanamkan aturan operasional langsung ke
                dalam alur transaksinya, supaya pendapatan dan data member tetap utuh tanpa perlu diawasi terus-menerus.
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
              <span className="section-tag blue">Sudah Dipakai</span>
              <h2 className="section-title">Sudah dipakai gym dan studio di Indonesia.</h2>
              <p className="section-desc">
                Sistem ini bukan rancangan di atas kertas. Setiap hari ia dipakai untuk mengurus operasional
                harian gym dan studio kebugaran mitra kami.
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
              <span className="section-tag">Tim Kami</span>
              <h2 className="section-title">Orang-orang di balik sistem ini.</h2>
              <p className="section-desc">
                PT Solusi Mitra Mandiri didirikan oleh pengembang perangkat lunak dan praktisi manajemen
                kebugaran. Sistem ini dibangun dari pengalaman langsung mengurus gym, bukan dari teori.
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
                <span className="section-tag">Coba Dulu</span>
                <h2 className="section-title">Lihat langsung sistemnya bekerja.</h2>
                <p className="section-desc">
                  Isi formulir di bawah, lalu kami hubungi Anda untuk sesi 30 menit. Kami akan lihat bersama
                  cara kerja gym Anda sekarang, dan tunjukkan bagian mana yang bisa langsung dibantu sistem ini.
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
                PT Solusi Mitra Mandiri membuat sistem manajemen gym: satu aplikasi untuk mengurus
                keanggotaan, jadwal personal trainer, kasir toko, pintu masuk, dan laporan keuangan gym
                di Indonesia.
              </p>
            </div>

            <div className="foot-col">
              <h5>Produk</h5>
              <ul>
                <li>
                  <a href="#domain">Fitur &amp; Modul</a>
                </li>
                <li>
                  <a href="#kontrol">Aturan yang Dijaga Sistem</a>
                </li>
                <li>
                  <a href="#masalah">Masalah yang Sering Terjadi</a>
                </li>
              </ul>
            </div>

            <div className="foot-col">
              <h5>Bagian Gym</h5>
              <ul>
                <li>
                  <a href="#domain">Meja Depan &amp; Calon Member</a>
                </li>
                <li>
                  <a href="#domain">Personal Trainer &amp; Pintu Masuk</a>
                </li>
                <li>
                  <a href="#domain">Kasir &amp; Gaji Karyawan</a>
                </li>
              </ul>
            </div>

            <div className="foot-col">
              <h5>Hubungi Kami</h5>
              <ul>
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </li>
                <li>
                  <a href="/admin/login">Masuk Admin</a>
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
