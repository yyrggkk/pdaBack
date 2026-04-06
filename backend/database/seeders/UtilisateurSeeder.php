<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class UtilisateurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $utilisateurs = [
            ['PIN' => 1111, 'nomComplet' => 'Serveur Demo', 'statut' => 'actif', 'role' => 'serveur'],
            ['PIN' => 7777, 'nomComplet' => 'Cuisinier Demo', 'statut' => 'actif', 'role' => 'cuisinier'],
        ];

        foreach ($utilisateurs as $utilisateur) {
            Utilisateur::query()->updateOrCreate(
                ['PIN' => $utilisateur['PIN']],
                $utilisateur
            );
        }
    }
}
