<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminGymPartnerController extends Controller
{
    public function index(): Response
    {
        $partners = DB::table('gym_partners')
            ->latest()
            ->get()
            ->map(fn ($partner) => [
                'id' => $partner->id,
                'name' => $partner->name,
                'logo_url' => Storage::url($partner->logo_path),
                'is_active' => (bool) $partner->is_active,
                'created_at' => $partner->created_at,
            ]);

        return Inertia::render('admin/GymPartners', [
            'partners' => $partners,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'logo' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
        ]);

        $logoPath = $request->file('logo')->store('gym-partners', 'public');

        DB::table('gym_partners')->insert([
            'name' => $validated['name'],
            'logo_path' => $logoPath,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Logo gym partner berhasil ditambahkan.');
    }

    public function destroy(int $partner): RedirectResponse
    {
        $gymPartner = DB::table('gym_partners')->where('id', $partner)->firstOrFail();

        Storage::disk('public')->delete($gymPartner->logo_path);
        DB::table('gym_partners')->where('id', $partner)->delete();

        return back()->with('success', 'Gym partner berhasil dihapus.');
    }
}
