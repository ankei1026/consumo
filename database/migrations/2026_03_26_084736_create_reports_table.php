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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('custcode');
            $table->foreign('custcode')->references('custcode')->on('consumers')->onDelete('cascade');
            $table->string('image');
            $table->longText('content');
            $table->unsignedBigInteger('water_consumption_id');
            $table->foreign('water_consumption_id')->references('id')->on('water_consumptions')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
