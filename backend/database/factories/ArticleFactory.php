<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Categorie;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    protected $model = Article::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => $this->faker->unique()->words(2, true),
            'description' => $this->faker->sentence(12),
            'prix' => $this->faker->randomFloat(2, 10, 180),
            'disponible' => $this->faker->boolean(88),
            'image' => null,
            'idCategorie' => Categorie::query()->inRandomOrder()->value('idCategorie') ?? Categorie::factory(),
        ];
    }
}
