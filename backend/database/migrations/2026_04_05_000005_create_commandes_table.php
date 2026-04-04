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
        Schema::create('commandes', function (Blueprint $table) {
            $table->increments('idCommande');
            $table->dateTime('dateCommande')->useCurrent();
            $table->enum('statut', ['en_cours', 'valide', 'en_preparation', 'servie', 'annule', 'paye'])->default('en_cours');
            $table->decimal('montantTotal', 10, 2)->default(0.00);
            $table->unsignedInteger('idTable');
            $table->unsignedInteger('idUtilisateur');

            $table->foreign('idTable', 'fk_commande_table')
                ->references('idTable')
                ->on('table_restaurants')
                ->onUpdate('cascade')
                ->onDelete('restrict');

            $table->foreign('idUtilisateur', 'fk_commande_utilisateur')
                ->references('idUtilisateur')
                ->on('utilisateurs')
                ->onUpdate('cascade')
                ->onDelete('restrict');

            $table->index('idUtilisateur', 'idx_commande_utilisateur');
            $table->index('statut', 'idx_commande_statut');
            $table->index('dateCommande', 'idx_commande_date');
            $table->index('idTable', 'idx_commande_table');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
