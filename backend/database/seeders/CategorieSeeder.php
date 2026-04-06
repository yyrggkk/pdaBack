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
            ['libelle' => 'Mains', 'description' => 'Plats principaux.'],
            ['libelle' => 'Starters', 'description' => 'Entrees.'],
            ['libelle' => 'Sides', 'description' => 'Accompagnements.'],
            ['libelle' => 'Desserts', 'description' => 'Desserts de la maison.'],
        ];

        foreach ($categories as $categorie) {
            Categorie::query()->updateOrCreate(
                ['libelle' => $categorie['libelle']],
                $categorie
            );
        }
    }
}
