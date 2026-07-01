<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@solusimitramandiri.com')],
            [
                'name' => 'Platform Admin',
                'password' => env('ADMIN_PASSWORD', 'admin123'),
                'is_admin' => true,
            ],
        );
    }   
}
