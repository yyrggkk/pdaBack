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
        Schema::create('factures', function (Blueprint $table) {
            $table->increments('idFacture');
            $table->string('numeroFacture', 50)->unique('uk_facture_numero');
            $table->dateTime('dateFacture')->useCurrent();
            $table->decimal('montantHT', 10, 2);
            $table->decimal('montantTVA', 10, 2);
            $table->decimal('montantTTC', 10, 2);
            $table->enum('modePaiement', ['especes', 'carte_bancaire', 'titre_restaurant']);
            $table->unsignedInteger('idCommande')->unique('uk_facture_commande');

            $table->foreign('idCommande', 'fk_facture_commande')
                ->references('idCommande')
                ->on('commandes')
                ->onUpdate('cascade')
                ->onDelete('restrict');

            $table->index('dateFacture', 'idx_facture_date');
            $table->index('idCommande', 'idx_facture_commande');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
