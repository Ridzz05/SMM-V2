import { Reveal } from '@/components/motion/Reveal';
import { SplitHeadline } from '@/components/motion/SplitHeadline';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/site';

/**
 * Seksi Instagram.
 *
 * Sengaja bukan feed tertanam: Instagram memblokir pembacaan anonim, jadi
 * setiap grid foto di sini hanya bisa berasal dari karangan. Yang ditampilkan
 * adalah hal yang bisa dipertanggungjawabkan: tautan ke akun resmi, nama
 * akunnya, dan daftar isi yang diunggah di sana.
 */
export default function InstagramSection() {
  return (
    <section className="section" id="instagram">
      <div className="wrap">
        <div className="insta">
          <Reveal className="insta-copy">
            <p className="eyebrow">Instagram</p>
            <SplitHeadline as="h2" className="insta-title">
              Keseharian gym mitra, direkam apa adanya.
            </SplitHeadline>
            <p className="lede">
              Foto dan video lapangan dari gym yang memakai sistem ini: suasana lantai latihan,
              sesi personal trainer, dan tim meja depan yang sedang bekerja.
            </p>

            <div className="insta-actions">
              <a className="btn" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                Buka @{INSTAGRAM_HANDLE}
              </a>
              <a className="btn btn-quiet" href="#demo">
                Minta demo dulu
              </a>
            </div>
          </Reveal>

          <Reveal className="insta-panel" delay={0.1}>
            <p className="insta-handle">
              <span className="insta-mark" aria-hidden="true">
                IG
              </span>
              @{INSTAGRAM_HANDLE}
            </p>

            <dl className="insta-facts">
              <div>
                <dt>Isi akun</dt>
                <dd>Suasana gym mitra, sesi latihan, dan kegiatan tim.</dd>
              </div>
              <div>
                <dt>Frekuensi</dt>
                <dd>Unggahan baru mengikuti jadwal kunjungan ke gym mitra.</dd>
              </div>
              <div>
                <dt>Cara menghubungi</dt>
                <dd>Pesan langsung lewat Instagram, atau WhatsApp untuk urusan demo.</dd>
              </div>
            </dl>

            <p className="insta-note">
              Foto di akun diunggah langsung oleh tim, jadi halaman ini tidak menyalinnya. Tekan
              tautan di atas untuk melihat unggahan terbaru.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
