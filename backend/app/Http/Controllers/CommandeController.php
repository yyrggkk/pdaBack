<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommandeRequest;
use App\Models\Article;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\TableRestaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    /**
     * S-B1: GET /api/commandes
     * List orders with optional status filter.
     * Include table, order lines with articles, timestamps.
     * Sort by creation date (oldest first).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Commande::with(['tableRestaurant', 'lignesCommande.article']);

        // Filter by status if provided
        if ($request->has('statut') && $request->statut) {
            $statuts = explode(',', $request->statut);
            $query->whereIn('statut', $statuts);
        }

        // Sort by creation date, oldest first
        $query->orderBy('dateCommande', 'asc');

        $commandes = $query->get();

        $response = $commandes->map(function ($commande) {
            return [
                'id' => $commande->idCommande,
                'table_id' => $commande->idTable,
                'table_numero' => $commande->tableRestaurant->numeroTable ?? null,
                'couverts' => $commande->couverts,
                'total' => (float) $commande->montantTotal,
                'statut' => $commande->statut,
                'date_commande' => $commande->dateCommande ? $commande->dateCommande->toIso8601String() : null,
                'lignes' => $commande->lignesCommande->map(function ($ligne) {
                    return [
                        'id' => $ligne->idLigne,
                        'article_id' => $ligne->idArticle,
                        'article_nom' => $ligne->article->nom ?? 'Article inconnu',
                        'quantite' => $ligne->quantite,
                        'prix_unitaire' => (float) $ligne->prixUnitaire,
                        'sous_total' => (float) $ligne->sousTotal,
                    ];
                }),
            ];
        });

        return response()->json(['commandes' => $response]);
    }

    /**
     * S-B2: PATCH /api/commandes/{id}/status
     * Update order status with validated transitions.
     * Body: { "statut": "en_preparation" }
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'statut' => 'required|string|in:en_preparation,prete,servie,facturee',
        ]);

        $commande = Commande::find($id);

        if (!$commande) {
            return response()->json([
                'message' => 'Commande non trouvée.',
            ], 404);
        }

        // Define allowed transitions
        $allowedTransitions = [
            'en_cours' => ['en_cuisine', 'annule'],
            'valide' => ['en_preparation', 'annule'],
            'en_cuisine' => ['en_preparation', 'annule'],
            'en_preparation' => ['prete', 'annule'],
            'prete' => ['servie'],
            'servie' => ['facturee'],
        ];

        $currentStatus = $commande->statut;
        $newStatus = $validated['statut'];

        // Check if transition is allowed
        $allowed = $allowedTransitions[$currentStatus] ?? [];
        if (!in_array($newStatus, $allowed)) {
            return response()->json([
                'message' => "Transition de statut non autorisée: '{$currentStatus}' → '{$newStatus}'.",
                'transitions_autorisees' => $allowed,
            ], 422);
        }

        // Update status and timestamp
        $commande->update([
            'statut' => $newStatus,
            'dateCommande' => $commande->dateCommande, // preserve original
        ]);

        // Reload with relationships
        $commande->load(['tableRestaurant', 'lignesCommande.article']);

        return response()->json([
            'id' => $commande->idCommande,
            'table_id' => $commande->idTable,
            'table_numero' => $commande->tableRestaurant->numeroTable ?? null,
            'statut' => $commande->statut,
            'total' => (float) $commande->montantTotal,
            'date_commande' => $commande->dateCommande ? $commande->dateCommande->toIso8601String() : null,
            'lignes' => $commande->lignesCommande->map(function ($ligne) {
                return [
                    'id' => $ligne->idLigne,
                    'article_id' => $ligne->idArticle,
                    'article_nom' => $ligne->article->nom ?? 'Article inconnu',
                    'quantite' => $ligne->quantite,
                    'prix_unitaire' => (float) $ligne->prixUnitaire,
                    'sous_total' => (float) $ligne->sousTotal,
                ];
            }),
        ]);
    }

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
