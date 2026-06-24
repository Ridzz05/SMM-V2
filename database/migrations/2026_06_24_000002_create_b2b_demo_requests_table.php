<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('b2b_demo_requests', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('pic_name');
            $table->string('phone_number');
            $table->string('email');
            $table->integer('estimated_members')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'contacted', 'demo_scheduled', 'deal', 'rejected'])->default('pending');
            $table->foreignId('processed_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('b2b_demo_requests'); }
};
