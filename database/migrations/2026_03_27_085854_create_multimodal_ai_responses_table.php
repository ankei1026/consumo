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
        // First, drop the table if it exists to recreate it with proper structure
        Schema::dropIfExists('multimodal_ai_responses');
        
        Schema::create('multimodal_ai_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->onDelete('cascade');
            $table->boolean('leak_detected')->default(false);
            $table->string('leak_type')->nullable();
            $table->string('severity')->nullable();
            $table->string('priority')->nullable();
            $table->text('image_analysis')->nullable();
            $table->text('recommendation')->nullable();
            $table->text('summary')->nullable();
            $table->json('text_consistency')->nullable();
            $table->json('consumption_analysis')->nullable();
            $table->json('trend_analysis')->nullable();
            $table->json('raw_response')->nullable();
            
            // Additional fields used in storeAiResponse
            $table->integer('tokens_used')->nullable();
            $table->integer('input_tokens')->nullable();
            $table->integer('output_tokens')->nullable();
            $table->decimal('estimated_cost', 10, 8)->nullable();
            $table->string('cache_key')->nullable();
            $table->string('image_hash')->nullable();
            $table->string('report_content_hash')->nullable();
            $table->string('consumption_hash')->nullable();
            $table->string('analysis_version')->nullable();
            $table->timestamp('analyzed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_cached')->default(false);
            
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index(['report_id']);
            $table->index(['leak_detected']);
            $table->index(['severity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('multimodal_ai_responses');
    }
};