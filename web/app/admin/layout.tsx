import type { Metadata } from 'next';

/**
 * Portal admin tidak boleh masuk indeks. `robots.txt` sudah melarang jalur
 * `/admin`, tetapi halaman yang tetap ditemukan lewat tautan eksternal bisa
 * terindeks tanpa isi; tag `noindex` menutup kemungkinan itu.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
