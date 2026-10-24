'use client';

type PagerProps = {
  page: number;
  pageCount: number;
  range: string;
  total: number;
  unit: string;
  onPage: (page: number) => void;
};

/**
 * Paginasi gaya buku besar: nomor halaman mono, rentang "4–6 dari 12", dan
 * tombol prev/next yang dinonaktifkan di ujung. Angka halaman di sekitar
 * halaman aktif dibatasi tiga supaya tidak meluber di layar sempit.
 */
export default function Pager({ page, pageCount, range, total, unit, onPage }: PagerProps) {
  if (total === 0) return null;

  const windowStart = Math.max(1, Math.min(page - 1, pageCount - 2));
  const windowEnd = Math.min(pageCount, windowStart + 2);
  const numbers: number[] = [];
  for (let n = windowStart; n <= windowEnd; n += 1) numbers.push(n);

  return (
    <div className="pager">
      <p className="pager-info">
        {range} dari {total} {unit}
      </p>
      <div className="pager-pages" role="group" aria-label="Halaman">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Halaman sebelumnya">
          ‹
        </button>
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-current={n === page ? 'page' : undefined}
            aria-label={`Halaman ${n}`}
          >
            {n}
          </button>
        ))}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pageCount} aria-label="Halaman berikutnya">
          ›
        </button>
      </div>
    </div>
  );
}
