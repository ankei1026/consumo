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
        Schema::table('customer_supports', function (Blueprint $table) {
            // Add status enum column
            $table->enum('status', ['pending', 'ongoing', 'resolved', 'rejected'])
                  ->default('pending')
                  ->after('message');

            // Add optional fields for tracking
            $table->timestamp('resolved_at')->nullable()->after('status');
            $table->text('response')->nullable()->after('resolved_at');
            $table->unsignedBigInteger('responded_by')->nullable()->after('response');

            // Add index for faster queries
            $table->index('status');
            $table->index('subject');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_supports', function (Blueprint $table) {
            $table->dropColumn(['status', 'resolved_at', 'response', 'responded_by']);
        });
    }
};
