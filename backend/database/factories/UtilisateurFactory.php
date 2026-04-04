<?php

namespace Database\Factories;

use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Utilisateur>
 */
class UtilisateurFactory extends Factory
{
    protected $model = Utilisateur::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'PIN' => $this->faker->unique()->numberBetween(1000, 9999),
            'nomComplet' => $this->faker->name(),
            'statut' => $this->faker->randomElement(['actif', 'actif', 'actif', 'inactif', 'suspendu']),
            'role' => $this->faker->randomElement(['serveur', 'cuisinier']),
        ];
    }
}
