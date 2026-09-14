/** Kanal kontak resmi: surel untuk konsultasi, WhatsApp untuk permintaan demo. */
export const CONTACT_EMAIL = 'info@solusimitramandiri.com';

/** Nomor WhatsApp sales, format internasional tanpa tanda plus (wa.me). */
export const WHATSAPP_NUMBER = '6281222827630';

/** Tautan surel dengan subjek terisi untuk tombol konsultasi di halaman publik. */
export function mailtoLink(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/** Tautan wa.me dengan isi pesan terisi, supaya pengunjung tidak mengetik ulang isian formulir. */
export function whatsappLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
