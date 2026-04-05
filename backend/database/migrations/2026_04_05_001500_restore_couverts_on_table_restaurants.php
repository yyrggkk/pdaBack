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
        if (!Schema::hasColumn('table_restaurants', 'couverts')) {
            Schema::table('table_restaurants', function (Blueprint $table) {
                $table->unsignedInteger('couverts')->default(0)->after('statut');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('table_restaurants', 'couverts')) {
            Schema::table('table_restaurants', function (Blueprint $table) {
                $table->dropColumn('couverts');
            });
        }
    }
};
