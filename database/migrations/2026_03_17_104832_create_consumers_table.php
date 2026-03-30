<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_consumers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('consumers', function (Blueprint $table) {
            $table->string('custcode', 6)->primary();
            $table->string('account_number')->unique();
            $table->string('name');
            $table->string('mobile_number')->nullable()->unique();
            $table->text('address')->nullable();
            $table->string('meter_number')->unique();
            $table->enum('connection_type', ['residential', 'commercial', 'institutional'])->default('residential');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consumers');
    }
};
