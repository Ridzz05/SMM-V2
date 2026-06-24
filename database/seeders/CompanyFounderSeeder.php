<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompanyFounderSeeder extends Seeder {
    public function run(): void {
        DB::table('company_founders')->insert([
            [
                'name' => 'Nama Founder 1',
                'role' => 'Co-Founder & Director of Product Development',
                'image_path' => '/images/founders/founder-product.png',
                'description' => 'Memimpin visi strategis dan peta jalan (roadmap) pengembangan ekosistem ERP. Beliau memastikan setiap fitur dirancang untuk memangkas birokrasi operasional dan memaksimalkan retensi pelanggan.',
                'order_position' => 1,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'name' => 'Nama Founder 2',
                'role' => 'Co-Founder & Chief Technology Officer (CTO)',
                'image_path' => '/images/founders/founder-cto.png',
                'description' => 'Arsitek utama di balik integrasi mutakhir berbasis kecerdasan buatan (AI). Berfokus penuh pada pengembangan teknologi visioner seperti AI Posture Assessment serta memastikan keamanan data enterprise.',
                'order_position' => 2,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'name' => 'Nama Founder 3',
                'role' => 'Co-Founder & Head of Software Engineering',
                'image_path' => '/images/founders/founder-engineering.png',
                'description' => 'Pakar rekayasa perangkat lunak yang memimpin implementasi teknis dan performa inti aplikasi. Berdedikasi dalam membangun arsitektur kode yang tangguh, cepat, dan responsif (SPA).',
                'order_position' => 3,
                'created_at' => now(), 'updated_at' => now()
            ]
        ]);
    }
}
