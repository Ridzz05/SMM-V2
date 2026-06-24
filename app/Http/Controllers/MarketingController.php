<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MarketingController extends Controller
{
    public function index()
    {
        // Mengambil data co-founders aktif berdasarkan urutan posisi
        $founders = DB::table('company_founders')
            ->where('is_active', true)
            ->orderBy('order_position', 'asc')
            ->get();

        return Inertia::render('marketing/LandingPage', [
            'founders' => $founders
        ]);
    }

    public function requestDemo(Request $request)
    {
        // Validasi data prospek B2B yang masuk
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'pic_name'     => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'email'        => 'required|email|max:255',
            'notes'        => 'nullable|string',
        ]);

        DB::table('b2b_demo_requests')->insert(array_merge($validated, [
            'status'     => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]));

        return back()->with('flash', [
            'success' => 'Permintaan demo berhasil dikirim! Tim sales PT Solusi Mitra Mandiri akan segera menghubungi Anda.'
        ]);
    }
}
