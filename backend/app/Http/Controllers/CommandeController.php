<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommandeRequest;
use App\Models\Article;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\TableRestaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    /**
     * Create a new order from the cart.
     *
     * @param StoreCommandeRequest $request
     * @return JsonResponse
     */
    public function store(StoreCommandeRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $commande = DB::transaction(function () use ($validated) {
                $table = TableRestaurant::query()
                    ->lockForUpdate()
                    ->findOrFail($validated['table_id']);

                $hasExistingCommandes = $table->commandes()->exists();
                $fixedCouverts = $hasExistingCommandes
                    ? $table->nombreDePlaces
                    : $validated['couverts'];

                if (!$hasExistingCommandes) {
                    $table->nombreDePlaces = $fixedCouverts;
                }

                // Get all article IDs from the request
                $articleIds = collect($validated['lignes'])->pluck('article_id')->toArray();

                // Fetch all articles in one query
                $articles = Article::whereIn('idArticle', $articleIds)
                    ->get()
                    ->keyBy('idArticle');

                // Calculate total and prepare ligne data
                $total = 0;
                $lignesData = [];

                foreach ($validated['lignes'] as $ligne) {
                    $article = $articles->get($ligne['article_id']);
                    $prixUnitaire = $article->prix;
                    $quantite = $ligne['quantite'];
                    $sousTotal = $prixUnitaire * $quantite;
                    $total += $sousTotal;

                    $lignesData[] = [
                        'idArticle' => $ligne['article_id'],
                        'quantite' => $quantite,
                        'prixUnitaire' => $prixUnitaire,
                        'sousTotal' => $sousTotal,
                    ];
                }

                // Create the commande
                $commande = Commande::create([
                    'idTable' => $validated['table_id'],
                    'idUtilisateur' => $validated['utilisateur_id'],
                    'couverts' => $fixedCouverts,
                    'montantTotal' => $total,
                    'statut' => 'en_cuisine',
                    'dateCommande' => now(),
                ]);

                // Create ligne_commandes
                foreach ($lignesData as $ligneData) {
                    LigneCommande::create([
                        'idCommande' => $commande->idCommande,
                        'idArticle' => $ligneData['idArticle'],
                        'quantite' => $ligneData['quantite'],
                        'prixUnitaire' => $ligneData['prixUnitaire'],
                        'sousTotal' => $ligneData['sousTotal'],
                    ]);
                }

                // Update table status to "occupe"
                $table->statut = 'occupe';
                $table->couverts = $fixedCouverts;
                $table->save();

                // Reload commande with relationships
                return $commande->fresh(['lignesCommande.article', 'tableRestaurant']);
            });

            // Format the response
            $response = [
                'id' => $commande->idCommande,
                'table_id' => $commande->idTable,
                'couverts' => $commande->couverts,
                'total' => (float) $commande->montantTotal,
                'statut' => $commande->statut,
                'lignes' => $commande->lignesCommande->map(function ($ligne) {
                    return [
                        'id' => $ligne->idLigne,
                        'article_id' => $ligne->idArticle,
                        'article_nom' => $ligne->article->nom,
                        'quantite' => $ligne->quantite,
                        'prix_unitaire' => (float) $ligne->prixUnitaire,
                        'sous_total' => (float) $ligne->sousTotal,
                    ];
                }),
                'created_at' => $commande->dateCommande->toIso8601String(),
            ];

            return response()->json($response, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la commande',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
