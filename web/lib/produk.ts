/**
 * Tangkapan layar sistem BossQueen ERP yang benar-benar berjalan, dipakai di
 * halaman publik sebagai bukti bahwa sistemnya ada, bukan mockup.
 *
 * Setiap penanda adalah kotak sorot di atas elemennya, diukur langsung dari DOM
 * aplikasi pada viewport yang sama dengan tangkapannya (1440x900 desktop,
 * 390x844 ponsel) lalu diubah ke persen. Kotak hanya menggambar garis tepi,
 * tanpa isian, jadi teks di dalamnya tetap terbaca. Nomornya diletakkan di
 * sudut kiri-atas kotak, di luar garis, supaya tidak menutupi satu huruf pun.
 *
 * Kotak yang saling menempel (misalnya tiga tombol kiosk) digabung jadi satu
 * kotak supaya tidak ada dua nomor yang bertumpuk.
 */

export type Marker = {
  /** Angka yang tampil di gambar dan di daftar keterangan. */
  no: number;
  /** Nama elemen seperti yang terbaca di layar. */
  label: string;
  /** Satu kalimat: apa fungsinya bagi staf gym. */
  note: string;
};

export type Shot = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  markers: Marker[];
};

export const DESKTOP_SHOT: Shot = {
  id: 'desktop',
  src: '/images/produk/bossqueen-desktop.webp',
  width: 1800,
  height: 1125,
  alt: 'Dasbor BossQueen ERP di layar desktop: sidebar navigasi, kartu status keanggotaan, dan kunjungan hari ini.',
  caption: 'Layar 1440x900. Sidebar terbuka, kartu ringkasan tampil tiga kolom.',
  markers: [
    {
      no: 1,
      label: 'Pencarian menu',
      note: 'Kolom cari di puncak sidebar, untuk menemukan modul tanpa membuka grupnya satu per satu.',
    },
    {
      no: 2,
      label: 'Grup Customer Service',
      note: 'Data member, Kedatangan tamu, Walk-in, Pendaftaran member, Pembayaran, Tracking sesi PT, sampai Kiosk sesi PT.',
    },
    {
      no: 3,
      label: 'Akun staf',
      note: 'Identitas staf yang sedang masuk, dengan tombol Install App untuk memasang aplikasi ke perangkat.',
    },
    {
      no: 4,
      label: 'Notifikasi dan monitor',
      note: 'Lonceng untuk pesan internal, ikon layar untuk membuka mode kiosk di tablet lobi.',
    },
    {
      no: 5,
      label: 'Judul halaman',
      note: 'Menyebut isi halaman dan pertanyaan yang dijawabnya, bukan sekadar mengulang nama menu.',
    },
    {
      no: 6,
      label: 'Pintasan kiosk',
      note: 'Tiga tombol: Check-in, Check-out, dan Booking Kelas, dibuka langsung tanpa menelusuri menu.',
    },
    {
      no: 7,
      label: 'Perlu tindak lanjut',
      note: 'Menyorot member kedaluwarsa bulan ini. Bila kosong, sistem menyatakan tidak ada yang perlu dihubungi.',
    },
    {
      no: 8,
      label: 'Status keanggotaan',
      note: 'Tiga angka: total member, member aktif, dan member tidak aktif, masing-masing dengan keterangannya.',
    },
    {
      no: 9,
      label: 'Kunjungan hari ini',
      note: 'Empat angka kehadiran harian: total kunjungan, member aktif, member tidak aktif, dan check-out.',
    },
    {
      no: 10,
      label: 'Chatbot melayang',
      note: 'Asisten yang bisa ditanya soal aturan keanggotaan dan SOP tanpa meninggalkan halaman.',
    },
  ],
};

export const MOBILE_SHOT: Shot = {
  id: 'mobile',
  src: '/images/produk/bossqueen-mobile.webp',
  width: 488,
  height: 1055,
  alt: 'Dasbor BossQueen ERP di layar ponsel: sidebar dilipat menjadi tombol menu, kartu ringkasan bertumpuk satu kolom.',
  caption: 'Layar 390x844. Sidebar dilipat, kartu ringkasan turun jadi satu kolom.',
  markers: [
    {
      no: 1,
      label: 'Tombol menu',
      note: 'Membuka sidebar yang dilipat. Sasaran sentuhnya 44x44 px, ukuran minimum yang nyaman di jempol.',
    },
    {
      no: 2,
      label: 'Notifikasi dan monitor',
      note: 'Sama seperti di desktop, diringkas jadi dua ikon di pojok kanan bar atas.',
    },
    {
      no: 3,
      label: 'Judul dan ringkasan',
      note: 'Turun ke bawah bar atas, tidak terpotong, dan tetap terbaca dalam satu kolom.',
    },
    {
      no: 4,
      label: 'Pintasan kiosk',
      note: 'Tiga tombol yang sama seperti di desktop, melipat jadi dua baris tanpa keluar dari layar.',
    },
    {
      no: 5,
      label: 'Perlu tindak lanjut',
      note: 'Kartu menyusut selebar layar; isinya tetap terbaca tanpa gulir mendatar.',
    },
    {
      no: 6,
      label: 'Status keanggotaan',
      note: 'Kartu tiga kolom di desktop menjadi satu kolom bertumpuk, urutan angkanya tetap sama.',
    },
    {
      no: 7,
      label: 'Kartu angka',
      note: 'Angka besar dengan label dan keterangan di bawahnya, terbaca sekali lihat di layar sempit.',
    },
  ],
};
