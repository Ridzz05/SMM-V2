import { CONTACT_EMAIL, WHATSAPP_NUMBER } from '@/lib/site';

/**
 * Satu sumber data untuk metadata dan data terstruktur.
 *
 * Semua nilai di sini nyata dan bisa diverifikasi dari halaman publik: nama
 * badan hukum, alamat situs, surel, dan nomor WhatsApp sales. Tidak ada alamat
 * kantor, jumlah pelanggan, atau klaim penghargaan karena tidak ada sumbernya.
 */
export const SITE_URL = (process.env.PUBLIC_SITE_URL ?? 'https://solusimitramandiri.com').replace(/\/$/, '');

export const SITE_NAME = 'PT Solusi Mitra Mandiri';

export const SITE_TAGLINE = 'Sistem Manajemen Gym All-In-One';

export const SITE_DESCRIPTION =
  'Sistem manajemen gym untuk meja depan, personal trainer, kasir toko, stok barang, jadwal kelas, pintu masuk, dan laporan keuangan. Satu basis data untuk seluruh operasional gym dan studio kebugaran di Indonesia.';

/** Nomor dalam format E.164, diturunkan dari nomor wa.me yang sudah dipakai. */
export const CONTACT_PHONE = `+${WHATSAPP_NUMBER}`;

/**
 * Token verifikasi Google Search Console.
 *
 * Nilainya bukan rahasia: tag ini memang dipublikasikan di <head> setiap
 * halaman. Disimpan di kode supaya deploy di VPS tidak butuh variabel
 * lingkungan tambahan, dan bisa ditimpa lewat env kalau properti diganti.
 */
export const GOOGLE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION ?? 'so7dc0akXMnNwR9RPple0PyFKa5t2UTpIpkV_PfJagg';

/**
 * Pertanyaan yang benar-benar muncul dari isi halaman ini, bukan daftar FAQ
 * template. Setiap jawaban hanya mengulang perilaku yang sudah dinyatakan di
 * seksi lain; tidak ada janji, angka, atau klaim baru.
 */
export const FAQ = [
  {
    q: 'Bagian gym mana saja yang dicakup sistem ini?',
    a: 'Sembilan modul: pencarian dan pendaftaran member, pelayanan meja depan, sesi personal trainer, data member dan perjanjian, kasir toko dan stok barang, laporan keuangan dan gaji karyawan, jadwal kelas, pintu masuk mandiri, serta pengaturan sistem dan riwayat aktivitas.',
  },
  {
    q: 'Apa yang terjadi kalau internet di gym mati?',
    a: 'Layar mandiri di depan pintu tetap berfungsi, sehingga member masih bisa masuk dan kehadiran tetap tercatat. Data yang tertunda tersinkron ketika koneksi kembali.',
  },
  {
    q: 'Siapa yang boleh membatalkan transaksi kasir?',
    a: 'Hanya manajer. Staf penjualan tidak bisa membatalkan nota sendiri, dan setiap pembatalan wajib disertai alasan tertulis yang masuk ke riwayat aktivitas yang tidak bisa diubah.',
  },
  {
    q: 'Apakah perjanjian dan formulir kesehatan masih memakai kertas?',
    a: 'Tidak. Perjanjian keanggotaan, formulir kesehatan, dan persetujuan program latihan ditandatangani member dan manajer di layar, lalu tersimpan di sistem dan bisa dicetak ulang.',
  },
  {
    q: 'Bagaimana cara melihat sistem ini bekerja?',
    a: 'Isi formulir permintaan demo di halaman ini. Kami hubungi Anda lewat WhatsApp atau email untuk sesi 30 menit daring tanpa biaya, memakai data gym Anda sendiri sebagai contoh.',
  },
];

const SERVICES = [
  'Pendaftaran member dan pencatatan calon member',
  'Pelayanan meja depan dan perjanjian keanggotaan digital',
  'Pengelolaan sesi personal trainer dengan verifikasi wajah',
  'Kasir toko, stok barang, dan pembatalan transaksi oleh manajer',
  'Laporan keuangan, komisi trainer, dan gaji karyawan',
  'Jadwal kelas dan pemesanan tempat',
  'Pintu masuk mandiri dan pemindai kehadiran',
  'Pengaturan sistem, wewenang karyawan, dan riwayat aktivitas',
];

/**
 * Organization + WebSite + Service dalam satu graf.
 *
 * `@id` dipakai supaya node saling merujuk, bukan menduplikasi entitas yang
 * sama. Google membaca satu graf per halaman.
 */
export function structuredData() {
  const orgId = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE_NAME,
        alternateName: 'Solusi Mitra Mandiri',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/images/brand/logo-mark-384.webp`,
          width: 384,
          height: 384,
        },
        description: SITE_DESCRIPTION,
        email: CONTACT_EMAIL,
        telephone: CONTACT_PHONE,
        areaServed: { '@type': 'Country', name: 'Indonesia' },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'sales',
            telephone: CONTACT_PHONE,
            email: CONTACT_EMAIL,
            availableLanguage: ['id'],
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        url: SITE_URL,
        name: `${SITE_NAME}: ${SITE_TAGLINE}`,
        inLanguage: 'id-ID',
        publisher: { '@id': orgId },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        inLanguage: 'id-ID',
        mainEntity: FAQ.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@type': 'Service',
        name: SITE_TAGLINE,
        serviceType: 'Sistem manajemen gym',
        provider: { '@id': orgId },
        areaServed: { '@type': 'Country', name: 'Indonesia' },
        availableLanguage: ['id'],
        description: SITE_DESCRIPTION,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Modul sistem manajemen gym',
          itemListElement: SERVICES.map((name) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name },
          })),
        },
      },
    ],
  };
}
