<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsFallbackToMultimodalAiResponsesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('multimodal_ai_responses', function (Blueprint $table) {
            if (!Schema::hasColumn('multimodal_ai_responses', 'is_fallback')) {
                $table->boolean('is_fallback')->default(false)->after('is_cached');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('multimodal_ai_responses', function (Blueprint $table) {
            if (Schema::hasColumn('multimodal_ai_responses', 'is_fallback')) {
                $table->dropColumn('is_fallback');
            }
        });
    }
}
