import type { Shot } from '@/lib/produk';

type ProductShotProps = {
  shot: Shot;
  /** `wide` untuk desktop, `tall` untuk ponsel. */
  variant: 'wide' | 'tall';
};

/**
 * Tangkapan layar sistem dengan kotak sorot dan nomor yang sudah dibakar ke
 * gambar oleh `web/scripts/annotate-shots.mjs`.
 *
 * Anotasi sengaja ada di piksel, bukan sebagai overlay CSS: kotak berposisi
 * persen bergeser terhadap isi gambar saat gambar mengecil, sedangkan yang
 * dibakar ke piksel selalu menempel. Efek sampingnya bagus: tidak ada
 * JavaScript, tidak ada elemen dekoratif di DOM, dan pembaca layar hanya
 * membaca satu deskripsi gambar plus daftar keterangan di bawahnya.
 */
export default function ProductShot({ shot, variant }: ProductShotProps) {
  return (
    <figure className={`shot shot-${variant}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="shot-image"
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        loading="lazy"
        decoding="async"
      />

      <figcaption className="shot-caption">
        <p className="shot-caption-line">{shot.caption}</p>
        <ol className="shot-legend">
          {shot.markers.map((marker) => (
            <li key={marker.no}>
              <span className="shot-legend-no">{marker.no}</span>
              <span>
                <strong>{marker.label}.</strong> {marker.note}
              </span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
