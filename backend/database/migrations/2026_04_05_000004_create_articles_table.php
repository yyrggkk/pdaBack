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
        Schema::create('articles', function (Blueprint $table) {
            $table->increments('idArticle');
            $table->string('nom', 100);
            $table->text('description')->nullable();
            $table->decimal('prix', 10, 2);
            $table->boolean('disponible')->default(true);
            $table->string('image', 255)->nullable();
            $table->unsignedInteger('idCategorie');

            $table->foreign('idCategorie', 'fk_article_categorie')
                ->references('idCategorie')
                ->on('categories')
                ->onUpdate('cascade')
                ->onDelete('restrict');

            $table->index('idCategorie', 'idx_article_categorie');
            $table->index('disponible', 'idx_article_disponible');
            $table->index('nom', 'idx_article_nom');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
