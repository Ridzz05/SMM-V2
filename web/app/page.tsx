import { fetchLanding } from '@/lib/server-api';
import DemoForm from '@/components/DemoForm';
import Navbar from '@/components/Navbar';
import { Reveal, RevealGroup } from '@/components/motion/Reveal';
import { SplitHeadline } from '@/components/motion/SplitHeadline';
import { CONTACT_EMAIL, mailtoLink } from '@/lib/site';
import ProductShot from '@/components/ProductShot';
import { DESKTOP_SHOT, MOBILE_SHOT } from '@/lib/produk';
import { FAQ, structuredData } from '@/lib/seo';

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
    title: 'Sesi personal trainer yang tidak terjadi, tapi tetap dibayar',
    body: 'Kuota member berkurang dan komisi trainer dibayar untuk sesi yang tidak ada di lapangan. Di sistem ini setiap sesi wajib diverifikasi lewat pemindaian wajah trainer dan member di mesin depan pintu, ditandatangani dua pihak, dan sesi pertama harus disetujui manajer.',
  },
  {
    title: 'Transaksi dibatalkan sembarangan, stok barang jadi tidak cocok',
    body: 'Kasir bisa membatalkan nota tanpa jejak, dan barang yang batal tidak kembali ke catatan stok. Sistem ini mengunci tombol batal hanya untuk manajer, mewajibkan alasan tertulis, mencegah stok minus, dan mencatat semua perubahan.',
  },
  {
    title: 'Calon member hilang di HP pribadi staf',
    body: 'Calon member dari iklan TikTok atau Instagram sering hanya disimpan di WhatsApp pribadi staf, lalu terlupakan. Sistem ini mewajibkan bukti tangkapan layar untuk calon member yang tidak bisa dihubungi, dan mengingatkan staf menghubungi ulang di hari ke-7, 14, dan 21.',
  },
  {
    title: 'Surat perjanjian dan riwayat kesehatan hilang saat dibutuhkan',
    body: 'Formulir kesehatan, kontak darurat, dan perjanjian personal trainer masih ditandatangani di kertas, sehingga mudah hilang saat ada sengketa atau cedera. Sistem ini menyimpan tanda tangan digital member dan manajer untuk setiap dokumen.',
  },
];

const MODULES = [
  {
    tag: 'Calon member',
    title: 'Pencarian dan pendaftaran member',
    body: 'Mencatat calon member datang dari mana, daftar harian siapa yang harus dihubungi beserta bukti chat, formulir cepat untuk tamu yang datang langsung, dan pengingat menghubungi member baru.',
  },
  {
    tag: 'Meja depan',
    title: 'Pelayanan harian di meja depan',
    body: 'Pendaftaran member dengan hitungan harga otomatis, biaya admin yang bisa diatur, kontak darurat wajib diisi, cetak perjanjian resmi, pembayaran cicilan, dan rekap kehadiran kelas.',
  },
  {
    tag: 'Personal trainer',
    title: 'Pengelolaan sesi personal trainer',
    body: 'Memisahkan member aktif dari yang sudah selesai, catatan latihan harian yang ditandatangani dua pihak, persetujuan manajer untuk sesi pertama, jadwal kalender trainer, serta saran latihan dan menu makan.',
  },
  {
    tag: 'Data member',
    title: 'Data lengkap member dan perjanjian',
    body: 'Semua data member di satu tempat lengkap dengan riwayatnya. Keanggotaan bisa dihentikan sementara, langganan diperpanjang otomatis maupun sekali klik, dan formulir kesehatan bisa dicetak ulang.',
  },
  {
    tag: 'Kasir dan barang',
    title: 'Kasir toko dan stok barang',
    body: 'Kasir untuk suplemen, minuman, peralatan gym, dan tiket harian. Stok tidak bisa minus, pencatatan barang masuk lengkap dengan harga distributor, dan pembatalan transaksi hanya oleh manajer.',
  },
  {
    tag: 'Keuangan dan gaji',
    title: 'Laporan keuangan dan gaji karyawan',
    body: 'Ringkasan pemasukan dari tiga sumber, pajak dihitung terpisah, komisi trainer dan bonus staf meja depan otomatis, catatan pengeluaran dengan foto nota, serta laporan laba rugi bulanan.',
  },
  {
    tag: 'Kelas',
    title: 'Jadwal kelas dan pemesanan tempat',
    body: 'Jadwal kelas mingguan yang otomatis mencegah bentrok antar instruktur atau ruangan, kuota peserta, harga tiket harian yang bisa diubah staf, dan rekap honor instruktur.',
  },
  {
    tag: 'Pintu masuk',
    title: 'Mesin masuk mandiri, pintu otomatis, pemindai',
    body: 'Layar mandiri di depan pintu yang tetap berfungsi walau internet mati dan mencegah satu kartu dipakai dua orang. Sesi personal trainer wajib verifikasi wajah trainer dan member, serta pemindaian postur tubuh.',
  },
  {
    tag: 'Pengaturan',
    title: 'Pengaturan sistem dan riwayat aktivitas',
    body: 'Mengatur paket langganan dan biaya admin, mengelola karyawan dengan delapan tingkat wewenang tanpa akun bersama, absensi staf dengan lokasi GPS, dan catatan aktivitas yang tidak bisa dihapus.',
  },
];

const RULES = [
  {
    title: 'Sesi pertama wajib disetujui manajer',
    body: 'Sesi personal trainer pertama dan kedua diperiksa manajer lewat sistem. Sesi berikutnya otomatis diblokir kalau formulir kesehatan dan program latihan belum ditandatangani.',
  },
  {
    title: 'Tanda tangan digital tersimpan permanen',
    body: 'Perjanjian keanggotaan, formulir kesehatan, dan persetujuan program latihan ditandatangani member dan manajer di layar. Semuanya tersimpan di sistem, tidak ada berkas kertas yang bisa hilang.',
  },
  {
    title: 'Sesi diverifikasi lewat wajah',
    body: 'Kartu tidak bisa dipakai untuk sesi personal trainer. Trainer dan member memindai wajah di depan kamera secara bergantian, supaya sesi yang tercatat benar-benar terjadi di gym.',
  },
  {
    title: 'Pembatalan hanya oleh manajer',
    body: 'Transaksi kasir hanya bisa dibatalkan manajer. Staf penjualan wajib melampirkan tangkapan layar untuk calon member yang gagal dihubungi, dan setiap perubahan tercatat di riwayat yang tidak bisa diubah.',
  },
];

const HERO_FACTS = [
  ['Pintu masuk', 'Tetap jalan walau internet mati'],
  ['Sesi PT', 'Diverifikasi lewat wajah'],
  ['Perjanjian', 'Ditandatangani di layar'],
  ['Gaji', 'Dihitung otomatis'],
];

export default async function HomePage() {
  const { founders, partners } = await fetchLanding();

  return (
    <div id="top">
      {/* Data terstruktur: Organization, WebSite, dan katalog modul. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />
      <Navbar brandMark={BRAND_MARK_IMG} />

      <main id="main">
        <section className="hero">
          <div className="wrap">
            <p className="eyebrow">Sistem manajemen gym</p>
            <SplitHeadline as="h1" className="hero-headline" delay={0.1}>
              Semua urusan gym Anda, <em>satu</em> sistem saja.
            </SplitHeadline>

            <div className="hero-grid">
              <div>
                <Reveal as="p" className="hero-desc" delay={0.2}>
                  PT Solusi Mitra Mandiri menyatukan meja depan, penjualan keanggotaan, personal trainer,
                  kasir, pintu masuk, sampai laporan keuangan ke dalam satu sistem. Semua divisi membaca
                  data yang sama, dan aturan mainnya dijaga sistem, bukan bergantung pada kedisiplinan staf.
                </Reveal>

                <Reveal className="hero-actions" delay={0.3}>
                  <a className="btn" href="#demo">
                    Jadwalkan demo
                  </a>
                  <a className="btn btn-quiet" href={mailtoLink('Konsultasi sistem manajemen gym')}>
                    Tanya dulu
                  </a>
                </Reveal>
              </div>

              <RevealGroup as="ul" className="hero-meta" stagger={0.06}>
                {HERO_FACTS.map(([label, value], index) => (
                  <li key={label} data-reveal>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>
                      <strong>{label}.</strong> {value}
                    </span>
                  </li>
                ))}
              </RevealGroup>
            </div>
          </div>
        </section>

        <section className="section" id="masalah">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Masalah yang sering terjadi</p>
                <SplitHeadline as="h2">Empat kebocoran yang paling sering menguras gym.</SplitHeadline>
              </div>
              <p className="lede">
                Uang dan data paling sering hilang bukan karena staf berniat buruk, tetapi karena
                pencatatan masih manual dan tidak ada yang memeriksa. Sistem ini menutup celah itu dengan
                aturan yang tidak bisa dilewati staf di lapangan.
              </p>
            </div>

            <RevealGroup as="ol" className="leaks" stagger={0.06}>
              {LEAKS.map((leak, index) => (
                <li className="leak" key={leak.title} data-reveal>
                  <span className="leak-index">0{index + 1}</span>
                  <h3>{leak.title}</h3>
                  <p>{leak.body}</p>
                </li>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="section" id="modul">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Fitur lengkap</p>
                <SplitHeadline as="h2">Sembilan bagian, semuanya tersambung.</SplitHeadline>
              </div>
              <p className="lede">
                Setiap divisi punya modulnya sendiri, tetapi semuanya membaca data yang sama. Tidak ada
                laporan yang harus disalin ulang dari satu aplikasi ke aplikasi lain.
              </p>
            </div>

            <div className="modules">
              <Reveal className="modules-aside">
                <span className="modules-counter">09</span>
                <span className="modules-counter-label">Modul operasional</span>
                <p>
                  Satu basis data, sembilan pintu masuk. Setiap modul memakai aturan wewenang yang sama,
                  jadi tidak ada data yang bisa diubah dari dua tempat berbeda.
                </p>
              </Reveal>

              <RevealGroup as="ol" className="module-list" stagger={0.05}>
                {MODULES.map((module, index) => (
                  <li className="module" key={module.title} data-reveal>
                    <span className="module-num">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <span className="module-tag">{module.tag}</span>
                      <h3>{module.title}</h3>
                      <p>{module.body}</p>
                    </div>
                  </li>
                ))}
              </RevealGroup>
            </div>
          </div>
        </section>

        <section className="section" id="produk">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Di dalam sistem</p>
                <SplitHeadline as="h2">Tampilan asli, bukan gambar rancangan.</SplitHeadline>
              </div>
              <p className="lede">
                Dua tangkapan layar di bawah diambil dari sistem yang berjalan dengan data uji.
                Nomor pada gambar menunjuk elemen yang sama pada daftar keterangan.
              </p>
            </div>

            <div className="shots">
              <Reveal>
                <ProductShot shot={DESKTOP_SHOT} variant="wide" />
              </Reveal>
              <Reveal>
                <ProductShot shot={MOBILE_SHOT} variant="tall" />
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section band" id="aturan">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Aturan yang dijaga sistem</p>
                <SplitHeadline as="h2">Dipaksa sistem, bukan sekadar imbauan.</SplitHeadline>
              </div>
              <p className="lede">
                Catatan manual gampang diubah orang. Aturan operasional ditanam langsung ke alur
                transaksi, supaya pendapatan dan data member tetap utuh tanpa perlu diawasi terus-menerus.
              </p>
            </div>

            <RevealGroup as="ol" className="rules" stagger={0.07}>
              {RULES.map((rule, index) => (
                <li className="rule-item" key={rule.title} data-reveal>
                  <span className="num">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{rule.title}</h3>
                    <p className="rule-body">{rule.body}</p>
                  </div>
                </li>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="section" id="mitra">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Sudah dipakai</p>
                <SplitHeadline as="h2">Gym dan studio yang memakai sistem ini.</SplitHeadline>
              </div>
              <p className="lede">
                Sistem ini dipakai setiap hari untuk mengurus operasional gym dan studio kebugaran mitra
                kami. Logo di bawah dikelola sendiri lewat portal admin.
              </p>
            </div>

            {partners.length > 0 ? (
              <RevealGroup className="partners" stagger={0.06}>
                {partners.map((partner) => (
                  <div className="partner" key={partner.id} data-reveal>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={partner.logo_path} alt={`Logo ${partner.name}`} loading="lazy" />
                    <span>{partner.name}</span>
                  </div>
                ))}
              </RevealGroup>
            ) : (
              <Reveal className="empty">
                <strong>Belum ada logo mitra</strong>
                <p>Logo mitra yang diunggah lewat portal admin akan tampil di sini.</p>
              </Reveal>
            )}
          </div>
        </section>

        <section className="section" id="tim">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Tim</p>
                <SplitHeadline as="h2">Orang-orang di balik sistem ini.</SplitHeadline>
              </div>
              <p className="lede">
                PT Solusi Mitra Mandiri didirikan oleh pengembang perangkat lunak dan praktisi manajemen
                kebugaran. Sistem ini dibangun dari pengalaman langsung mengurus gym, bukan dari teori.
              </p>
            </div>

            <RevealGroup className="founders" stagger={0.08}>
              {founders.map((founder) => (
                <article className="founder" key={founder.id} data-reveal>
                  {founder.image_path ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={founder.image_path} alt={founder.name} loading="lazy" />
                  ) : null}
                  <div>
                    <span className="founder-role">{founder.role}</span>
                    <h3>{founder.name}</h3>
                    <p>{founder.description}</p>
                  </div>
                </article>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="section" id="tanya">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Pertanyaan umum</p>
                <SplitHeadline as="h2">Yang paling sering ditanyakan pemilik gym.</SplitHeadline>
              </div>
              <p className="lede">
                Lima hal yang muncul sebelum orang memutuskan mencoba. Jawabannya mengacu ke perilaku
                sistem yang dijelaskan di seksi sebelumnya.
              </p>
            </div>

            <RevealGroup as="dl" className="faq" stagger={0.05}>
              {FAQ.map((item) => (
                <div className="faq-item" key={item.q} data-reveal>
                  <dt>{item.q}</dt>
                  <dd>{item.a}</dd>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="section" id="demo">
          <div className="wrap">
            <div className="demo-panel">
              <Reveal className="demo-side">
                <p className="eyebrow">Coba dulu</p>
                <h2>Lihat sistemnya bekerja pada data gym Anda.</h2>
                <p>
                  Isi formulir, lalu kami hubungi Anda untuk sesi 30 menit. Kita lihat bersama cara kerja
                  gym Anda sekarang, dan bagian mana yang bisa langsung dibantu sistem ini.
                </p>
                <ul className="demo-facts">
                  <li>
                    <span>Durasi</span>
                    <span>30 menit, daring</span>
                  </li>
                  <li>
                    <span>Isi</span>
                    <span>Telusuri modul yang Anda butuhkan</span>
                  </li>
                  <li>
                    <span>Biaya</span>
                    <span>Tidak ada</span>
                  </li>
                </ul>
              </Reveal>

              <Reveal delay={0.1}>
                <DemoForm />
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-top">
            <div>
              <a className="foot-brand" href="#top">
                {BRAND_MARK_IMG}
                <span className="brand-text">
                  <strong>Solusi Mitra Mandiri</strong>
                  <span>Sistem Gym</span>
                </span>
              </a>
              <p style={{ marginTop: 12 }}>
                Sistem manajemen gym: keanggotaan, jadwal personal trainer, kasir toko, pintu masuk, dan
                laporan keuangan dalam satu aplikasi.
              </p>
            </div>

            <nav className="foot-links" aria-label="Tautan kaki halaman">
              <a href="#masalah">Masalah</a>
              <a href="#modul">Modul</a>
              <a href="#produk">Tampilan sistem</a>
              <a href="#aturan">Aturan sistem</a>
              <a href="#mitra">Mitra</a>
              <a href="#tim">Tim</a>
              <a href="#tanya">Pertanyaan umum</a>
              <a href="#demo">Jadwalkan demo</a>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <a href="/admin/login">Masuk admin</a>
            </nav>
          </div>

          <div className="foot-bottom">
            <span>&copy; 2026 PT Solusi Mitra Mandiri</span>
            <span>Indonesia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
