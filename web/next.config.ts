import type { NextConfig } from 'next';

// Seluruh permintaan API dan aset media diteruskan ke server Go sehingga browser
// hanya berkomunikasi dengan satu origin. Cookie sesi admin ikut mengalir apa
// adanya dan tidak ada preflight CORS di jalur normal.
//
// PENTING: nilai ini dibaca saat `next build`, bukan saat `next start`. Next
// membekukan hasil rewrites() ke .next/routes-manifest.json, sehingga mengubah
// API_ORIGIN setelah build tidak berpengaruh sama sekali. Salah origin tidak
// memunculkan galat — permintaan hanya mengembalikan 200 tanpa isi — jadi
// pastikan variabel ini benar sebelum membangun untuk produksi.
const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:8080';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
      { source: '/uploads/:path*', destination: `${apiOrigin}/uploads/:path*` },
      { source: '/images/:path*', destination: `${apiOrigin}/images/:path*` },
      { source: '/videos/:path*', destination: `${apiOrigin}/videos/:path*` },
    ];
  },
};

export default nextConfig;
