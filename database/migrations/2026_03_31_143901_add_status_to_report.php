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
        Schema::table('reports', function (Blueprint $table) {
            // Add status enum column
            $table->enum('status', ['pending', 'ongoing', 'resolved', 'rejected'])
                  ->default('pending')
                  ->after('content');

            // Add optional fields for tracking
            $table->timestamp('resolved_at')->nullable()->after('status');
            $table->text('resolution_notes')->nullable()->after('resolved_at');
            $table->unsignedBigInteger('resolved_by')->nullable()->after('resolution_notes');

            // Add index for faster queries
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['status', 'resolved_at', 'resolution_notes', 'resolved_by']);
        });
    }
};
