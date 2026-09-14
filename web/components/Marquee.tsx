type Fact = { name: string; note: string };

/**
 * Satu baris ambang operasional yang berjalan sendiri. Semuanya angka yang bisa
 * ditelusuri ke kode AIO: konstanta dan ambang batas. Tidak ada metrik
 * pemasaran di sini.
 */
const CONTROLS: Fact[] = [
  { name: 'Embedding Wajah', note: '128 dimensi' },
  { name: 'Token Bukti', note: 'TTL 30 detik' },
  { name: 'Radius Geofence', note: '100 meter' },
  { name: 'Guard Check-in', note: '4 jam' },
  { name: 'Timer Sesi PT', note: '75 menit' },
  { name: 'Approval Sesi PT', note: 'Sesi 1 & 2' },
  { name: 'Verifikasi Offline', note: 'IndexedDB lokal' },
  { name: 'Ambang Kecocokan', note: 'Euclidean 0,40' },
];

export default function Marquee() {
  // Track digandakan dua kali: animasi marquee-x bergeser -50% agar loop mulus.
  const items = CONTROLS.map((fact) => (
    <span className="wire-item" key={fact.name}>
      <span className="wire-dot">•</span>
      <span className="wire-name">{fact.name}</span>
      <span className="wire-coord">{fact.note}</span>
    </span>
  ));

  return (
    <div className="wire">
      <div className="container wide">
        <div className="wire-inner">
          <div className="wire-left">
            <span className="wire-mark" aria-hidden="true">
              <span className="wire-pulse" />
            </span>
            <span className="wire-title">
              <b>Ambang Operasional</b>
              <span>Diukur dari basis kode</span>
            </span>
          </div>
          <div className="wire-rows" aria-hidden="true">
            <div className="wire-row">
              <div className="marquee-track">
                {items}
                {items}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
