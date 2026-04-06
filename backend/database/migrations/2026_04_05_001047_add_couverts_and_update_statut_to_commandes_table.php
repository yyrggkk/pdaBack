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
        // Keep statut values aligned with current app flow across drivers.
        Schema::table('commandes', function (Blueprint $table) {
            $table->enum('statut', ['en_cours', 'valide', 'en_preparation', 'en_cuisine', 'prete', 'servie', 'annule', 'paye', 'facturee'])
                ->default('en_cours')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert statut enum
        Schema::table('commandes', function (Blueprint $table) {
            $table->enum('statut', ['en_cours', 'valide', 'en_preparation', 'servie', 'annule', 'paye'])
                ->default('en_cours')
                ->change();
        });

        Schema::table('commandes', function (Blueprint $table) {
            $table->dropColumn('couverts');
        });
    }
};
