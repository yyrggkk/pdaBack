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
        Schema::create('ligne_commandes', function (Blueprint $table) {
            $table->increments('idLigne');
            $table->unsignedInteger('quantite')->default(1);
            $table->decimal('prixUnitaire', 10, 2);
            $table->decimal('sousTotal', 10, 2);
            $table->text('commentaire')->nullable();
            $table->unsignedInteger('idCommande');
            $table->unsignedInteger('idArticle');

            $table->foreign('idCommande', 'fk_ligne_commande')
                ->references('idCommande')
                ->on('commandes')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('idArticle', 'fk_ligne_article')
                ->references('idArticle')
                ->on('articles')
                ->onUpdate('cascade')
                ->onDelete('restrict');

            $table->index('idCommande', 'idx_ligne_commande');
            $table->index('idArticle', 'idx_ligne_article');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ligne_commandes');
    }
};
