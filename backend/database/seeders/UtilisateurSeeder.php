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
            ['PIN' => 1101, 'nomComplet' => 'Youssef El Idrissi', 'statut' => 'actif', 'role' => 'serveur'],
            ['PIN' => 1102, 'nomComplet' => 'Nadia Bennis', 'statut' => 'actif', 'role' => 'serveur'],
            ['PIN' => 1103, 'nomComplet' => 'Hamza Alaoui', 'statut' => 'actif', 'role' => 'serveur'],
            ['PIN' => 1104, 'nomComplet' => 'Salma Tazi', 'statut' => 'actif', 'role' => 'serveur'],
            ['PIN' => 1105, 'nomComplet' => 'Mehdi Chraibi', 'statut' => 'inactif', 'role' => 'serveur'],
            ['PIN' => 2201, 'nomComplet' => 'Khadija Amrani', 'statut' => 'actif', 'role' => 'cuisinier'],
            ['PIN' => 2202, 'nomComplet' => 'Omar Benjelloun', 'statut' => 'actif', 'role' => 'cuisinier'],
            ['PIN' => 2203, 'nomComplet' => 'Rachid Lamrani', 'statut' => 'actif', 'role' => 'cuisinier'],
            ['PIN' => 2204, 'nomComplet' => 'Meryem El Fassi', 'statut' => 'suspendu', 'role' => 'cuisinier'],
            ['PIN' => 2205, 'nomComplet' => 'Anas Ouhaddou', 'statut' => 'actif', 'role' => 'cuisinier'],
        ];

        foreach ($utilisateurs as $utilisateur) {
            Utilisateur::query()->updateOrCreate(
                ['PIN' => $utilisateur['PIN']],
                $utilisateur
            );
        }
    }
}
