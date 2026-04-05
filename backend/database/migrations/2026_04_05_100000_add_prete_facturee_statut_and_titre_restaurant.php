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
        // Add 'prete' and 'facturee' to commandes statut enum
        DB::statement("ALTER TABLE commandes MODIFY COLUMN statut ENUM('en_cours', 'valide', 'en_preparation', 'en_cuisine', 'prete', 'servie', 'annule', 'paye', 'facturee') DEFAULT 'en_cours'");

        // Add 'titre_restaurant' to factures modePaiement enum
        DB::statement("ALTER TABLE factures MODIFY COLUMN modePaiement ENUM('especes', 'carte_bancaire', 'titre_restaurant')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE commandes MODIFY COLUMN statut ENUM('en_cours', 'valide', 'en_preparation', 'en_cuisine', 'servie', 'annule', 'paye') DEFAULT 'en_cours'");
        DB::statement("ALTER TABLE factures MODIFY COLUMN modePaiement ENUM('especes', 'carte_bancaire')");
    }
};
