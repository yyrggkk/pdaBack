<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Commande;
use App\Models\LigneCommande;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LigneCommande>
 */
class LigneCommandeFactory extends Factory
{
    protected $model = LigneCommande::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $articleId = Article::query()->inRandomOrder()->value('idArticle');
        $article = $articleId ? Article::find($articleId) : null;

        $quantite = $this->faker->numberBetween(1, 4);
        $prixUnitaire = (float) ($article?->prix ?? $this->faker->randomFloat(2, 8, 120));

        return [
            'quantite' => $quantite,
            'prixUnitaire' => $prixUnitaire,
            'sousTotal' => round($quantite * $prixUnitaire, 2),
            'commentaire' => $this->faker->optional(0.25)->randomElement([
                'Sans oignons',
                'Peu epice',
                'Cuisson a point',
                'Servir rapidement',
                'Sans coriandre',
            ]),
            'idCommande' => Commande::query()->inRandomOrder()->value('idCommande') ?? Commande::factory(),
            'idArticle' => $articleId ?? Article::factory(),
        ];
    }
}
