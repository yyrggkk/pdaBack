<?php

namespace Database\Seeders;

use App\Models\Categorie;
use Illuminate\Database\Seeder;

class CategorieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['libelle' => 'Entrees Marocaines', 'description' => 'Selection d entrees traditionnelles marocaines.'],
            ['libelle' => 'Tajines', 'description' => 'Tajines mijotes aux epices de la maison.'],
            ['libelle' => 'Couscous', 'description' => 'Couscous du vendredi et variantes maison.'],
            ['libelle' => 'Grillades', 'description' => 'Viandes et brochettes grillees au charbon.'],
            ['libelle' => 'Patisseries', 'description' => 'Desserts et douceurs marocaines.'],
            ['libelle' => 'Boissons Chaudes', 'description' => 'The, cafe et infusions.'],
            ['libelle' => 'Jus Frais', 'description' => 'Jus prepares a la commande.'],
            ['libelle' => 'Boissons Froides', 'description' => 'Eaux et sodas.'],
        ];

        foreach ($categories as $categorie) {
            Categorie::query()->updateOrCreate(
                ['libelle' => $categorie['libelle']],
                $categorie
            );
        }
    }
}
