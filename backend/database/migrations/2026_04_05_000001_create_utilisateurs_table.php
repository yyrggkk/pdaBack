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
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->increments('idUtilisateur');
            $table->unsignedInteger('PIN');
            $table->string('nomComplet', 100);
            $table->enum('statut', ['actif', 'inactif', 'suspendu'])->default('actif');
            $table->enum('role', ['serveur', 'cuisinier']);

            $table->index('statut', 'idx_utilisateur_statut');
            $table->index('role', 'idx_utilisateur_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};
