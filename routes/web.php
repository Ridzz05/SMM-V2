<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminGymPartnerController;
use App\Http\Controllers\MarketingController;

// Rute Utama Landing Page B2B PT Solusi Mitra Mandiri
Route::get('/', [MarketingController::class, 'index'])->name('marketing.index');
Route::post('/request-demo', [MarketingController::class, 'requestDemo'])->name('marketing.request-demo');

Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AdminAuthController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [AdminAuthController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('admin.login.store');
});

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/gym-partners', [AdminGymPartnerController::class, 'index'])->name('gym-partners.index');
    Route::post('/gym-partners', [AdminGymPartnerController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('gym-partners.store');
    Route::delete('/gym-partners/{partner}', [AdminGymPartnerController::class, 'destroy'])->name('gym-partners.destroy');
    Route::post('/logout', [AdminAuthController::class, 'destroy'])->name('logout');
});
