<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\Facture;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Facture>
 */
class FactureFactory extends Factory
{
    protected $model = Facture::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $montantTTC = $this->faker->randomFloat(2, 40, 600);
        $montantHT = round($montantTTC / 1.2, 2);
        $montantTVA = round($montantTTC - $montantHT, 2);

        return [
            'numeroFacture' => strtoupper('FAC-' . $this->faker->unique()->bothify('######')),
            'dateFacture' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'montantHT' => $montantHT,
            'montantTVA' => $montantTVA,
            'montantTTC' => $montantTTC,
            'modePaiement' => $this->faker->randomElement(['especes', 'carte_bancaire']),
            'idCommande' => Commande::query()->doesntHave('facture')->inRandomOrder()->value('idCommande') ?? Commande::factory(),
        ];
    }
}
