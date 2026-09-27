import type { MetadataRoute } from 'next';

/**
 * Peta halaman untuk mesin pencari. Hanya halaman publik yang didaftarkan;
 * area admin sengaja tidak, dan sudah dilarang lewat robots.txt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.PUBLIC_SITE_URL ?? 'https://solusimitramandiri.com').replace(/\/$/, '');

  return [
    {
      url: `${base}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
