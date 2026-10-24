'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * Paginasi untuk daftar yang tumbuh tanpa batas (permintaan demo, mitra).
 *
 * Kenapa di klien, bukan di API: daftar admin sekarang dimuat sekaligus dan
 * difilter di memori, jadi memotong halaman di sini tidak menambah round-trip.
 * Kalau nanti jumlahnya ribuan, pindahkan `page`/`perPage` ke query API dan
 * hook ini cukup menerima `total` dari server.
 */
export function usePagination<T>(items: T[], perPage = 10) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / perPage));

  // Filter atau pencarian bisa memperkecil hasil sampai halaman aktif melewati
  // batas. Tanpa penjepitan ini tabel tampak kosong padahal datanya ada.
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  const rows = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page, perPage]);

  const range = items.length === 0 ? '0' : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, items.length)}`;

  return { page, setPage, pageCount, rows, range, total: items.length };
}
