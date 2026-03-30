<?php

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
        Schema::create('water_consumptions', function (Blueprint $table) {
            $table->id();
            $table->string('custcode');
            $table->integer('current_reading');
            $table->integer('previous_reading');
            $table->integer('consumption');
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();

            $table->foreign('custcode')->references('custcode')->on('consumers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('water_consumptions');
    }
};
