<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\TableRestaurant;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Commande>
 */
class CommandeFactory extends Factory
{
    protected $model = Commande::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dateCommande' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'statut' => $this->faker->randomElement(['en_cours', 'valide', 'en_preparation', 'servie', 'annule', 'paye']),
            'montantTotal' => 0,
            'idTable' => TableRestaurant::query()->inRandomOrder()->value('idTable') ?? TableRestaurant::factory(),
            'idUtilisateur' => Utilisateur::query()->where('role', 'serveur')->inRandomOrder()->value('idUtilisateur')
                ?? Utilisateur::factory()->state(['role' => 'serveur']),
        ];
    }
}
