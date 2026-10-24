import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * robots.txt dibuat oleh Next supaya daftar sitemap dan host selalu ikut.
 * Versi statis di public/ sudah dihapus; dua sumber akan saling menimpa.
 *
 * Yang dilarang: seluruh portal admin dan API. Keduanya bukan halaman publik
 * dan tidak punya konten yang berguna di hasil pencarian.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
