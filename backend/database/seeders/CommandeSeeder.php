<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Commande;
use App\Models\Facture;
use App\Models\LigneCommande;
use App\Models\TableRestaurant;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class CommandeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $serveurs = Utilisateur::query()
            ->where('role', 'serveur')
            ->where('statut', 'actif')
            ->pluck('idUtilisateur');

        $tables = TableRestaurant::query()
            ->where('statut', '!=', 'indisponible')
            ->pluck('idTable');

        $articlesDisponibles = Article::query()
            ->where('disponible', true)
            ->get(['idArticle', 'prix']);

        if ($serveurs->isEmpty() || $tables->isEmpty() || $articlesDisponibles->isEmpty()) {
            return;
        }

        $statuses = [
            'en_cours',
            'en_cours',
            'valide',
            'en_preparation',
            'servie',
            'servie',
            'paye',
            'paye',
            'annule',
        ];

        for ($i = 1; $i <= 120; $i++) {
            $statut = fake()->randomElement($statuses);

            $commande = Commande::factory()->create([
                'idUtilisateur' => $serveurs->random(),
                'idTable' => $tables->random(),
                'statut' => $statut,
                'dateCommande' => fake()->dateTimeBetween('-21 days', 'now'),
                'montantTotal' => 0,
            ]);

            $nombreLignes = fake()->numberBetween(1, 6);
            $articlesChoisis = $articlesDisponibles->random(min($nombreLignes, $articlesDisponibles->count()));
            $articlesChoisis = $articlesChoisis instanceof \Illuminate\Support\Collection
                ? $articlesChoisis
                : collect([$articlesChoisis]);

            $total = 0;

            foreach ($articlesChoisis as $article) {
                $quantite = fake()->numberBetween(1, 4);
                $prixUnitaire = (float) $article->prix;
                $sousTotal = round($quantite * $prixUnitaire, 2);
                $total += $sousTotal;

                LigneCommande::factory()->create([
                    'idCommande' => $commande->idCommande,
                    'idArticle' => $article->idArticle,
                    'quantite' => $quantite,
                    'prixUnitaire' => $prixUnitaire,
                    'sousTotal' => $sousTotal,
                    'commentaire' => fake()->optional(0.2)->randomElement([
                        'Sans piment',
                        'Plus de sauce',
                        'A servir chaud',
                        'Sans sel',
                        'Pain supplementaire',
                    ]),
                ]);
            }

            $commande->update(['montantTotal' => round($total, 2)]);

            if (in_array($commande->statut, ['servie', 'paye'], true)) {
                $montantTTC = round((float) $commande->montantTotal, 2);
                $montantHT = round($montantTTC / 1.2, 2);
                $montantTVA = round($montantTTC - $montantHT, 2);

                Facture::factory()->create([
                    'idCommande' => $commande->idCommande,
                    'numeroFacture' => sprintf('FAC-%s-%04d', now()->format('Ym'), $i),
                    'dateFacture' => fake()->dateTimeBetween($commande->dateCommande, 'now'),
                    'montantHT' => $montantHT,
                    'montantTVA' => $montantTVA,
                    'montantTTC' => $montantTTC,
                    'modePaiement' => fake()->randomElement(['especes', 'carte_bancaire']),
                ]);
            }
        }

        // Synchronise l etat des tables avec la derniere commande connue.
        $commandesParTable = Commande::query()
            ->select(['idTable', 'statut'])
            ->orderByDesc('idCommande')
            ->get()
            ->unique('idTable');

        foreach ($commandesParTable as $etat) {
            $statutTable = match ($etat->statut) {
                'en_cours', 'valide', 'en_preparation' => 'occupe',
                'servie' => 'servie',
                default => 'libre',
            };

            TableRestaurant::query()
                ->where('idTable', $etat->idTable)
                ->where('statut', '!=', 'indisponible')
                ->update(['statut' => $statutTable]);
        }
    }
}
