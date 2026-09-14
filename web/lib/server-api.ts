import { headers } from 'next/headers';

import type { LandingData } from '@/lib/api';

/**
 * Mengambil data landing dari sisi server.
 *
 * Permintaan diarahkan ke origin permintaan yang sedang diproses, bukan ke
 * API_ORIGIN secara langsung, sehingga permintaan SSR melewati rewrite yang
 * sama dengan permintaan browser. Dengan begitu hanya ada satu sumber
 * kebenaran untuk alamat API: nilai API_ORIGIN yang dibekukan saat build.
 */
export async function fetchLanding(): Promise<LandingData> {
  const headerList = await headers();
  const host = headerList.get('host');

  if (!host) {
    throw new Error('Header Host tidak tersedia; tidak dapat menjangkau API.');
  }

  const protocol = headerList.get('x-forwarded-proto') ?? 'http';
  const res = await fetch(`${protocol}://${host}/api/landing`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`API landing merespons ${res.status}`);
  }

  return res.json();
}
