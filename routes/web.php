<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\MarketingController;

// Rute Utama Landing Page B2B PT Solusi Mitra Mandiri
Route::get('/', [MarketingController::class, 'index'])->name('marketing.index');
Route::post('/request-demo', [MarketingController::class, 'requestDemo'])->name('marketing.request-demo');
