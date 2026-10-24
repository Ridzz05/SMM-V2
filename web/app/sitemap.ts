import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Peta halaman untuk mesin pencari. Hanya halaman publik yang didaftarkan;
 * portal admin sengaja tidak, dan sudah dilarang lewat robots.txt.
 *
 * `lastModified` memakai waktu build. Nilainya jujur untuk halaman yang
 * dirender dari data live (`force-dynamic`), karena isinya memang berubah
 * setiap kali situs di-deploy ulang.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
