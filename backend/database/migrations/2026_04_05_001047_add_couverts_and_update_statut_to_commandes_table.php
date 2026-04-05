<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->unsignedInteger('couverts')->default(1)->after('montantTotal');
        });

        // Update the statut enum to include 'en_cuisine'
        DB::statement("ALTER TABLE commandes MODIFY COLUMN statut ENUM('en_cours', 'valide', 'en_preparation', 'en_cuisine', 'servie', 'annule', 'paye') DEFAULT 'en_cours'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert statut enum
        DB::statement("ALTER TABLE commandes MODIFY COLUMN statut ENUM('en_cours', 'valide', 'en_preparation', 'servie', 'annule', 'paye') DEFAULT 'en_cours'");

        Schema::table('commandes', function (Blueprint $table) {
            $table->dropColumn('couverts');
        });
    }
};
