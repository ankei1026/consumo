<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('customer_supports', function (Blueprint $table) {
            $table->text('admin_feedback')->nullable()->after('status');
        });
    }

    public function down()
    {
        Schema::table('customer_supports', function (Blueprint $table) {
            $table->dropColumn('admin_feedback');
        });
    }
};
