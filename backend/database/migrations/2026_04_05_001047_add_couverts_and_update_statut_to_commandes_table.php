<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the statut enum to include 'en_cuisine'
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE commandes MODIFY COLUMN statut ENUM('en_cours', 'valide', 'en_preparation', 'en_cuisine', 'servie', 'annule', 'paye') DEFAULT 'en_cours'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert statut enum
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE commandes MODIFY COLUMN statut ENUM('en_cours', 'valide', 'en_preparation', 'servie', 'annule', 'paye') DEFAULT 'en_cours'");
        }
    }
};
