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
        Schema::create('table_restaurants', function (Blueprint $table) {
            $table->increments('idTable');
            $table->unsignedInteger('numeroTable')->unique('uk_table_numero');
            $table->unsignedInteger('nombreDePlaces');
            $table->enum('statut', ['libre', 'occupe', 'servie', 'indisponible'])->default('libre');

            $table->index('statut', 'idx_table_statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_restaurants');
    }
};
