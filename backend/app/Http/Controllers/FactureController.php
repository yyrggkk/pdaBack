<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\Facture;
use App\Models\TableRestaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FactureController extends Controller
{
    /**
     * S-B3: Generate an invoice from an order.
     * POST /api/factures
     *
     * Body: { commande_id, mode_paiement }
     * - Calculate subtotal HT, TVA (10%), total TTC
     * - Record payment method
     * - Set table status to "libre"
     * - Update order status to "facturee"
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'commande_id' => 'required|integer|exists:commandes,idCommande',
            'mode_paiement' => 'required|string|in:especes,carte_bancaire,titre_restaurant',
        ]);

        // Check order is in a valid state for invoicing (servie)
        $commande = Commande::with(['lignesCommande.article', 'tableRestaurant'])
            ->findOrFail($validated['commande_id']);

        if ($commande->statut === 'facturee') {
            return response()->json([
                'message' => 'Cette commande est déjà facturée.',
            ], 422);
        }

        if (!in_array($commande->statut, ['servie', 'prete', 'en_cuisine', 'en_preparation', 'valide', 'en_cours'])) {
            return response()->json([
                'message' => 'Cette commande ne peut pas être facturée dans son état actuel.',
            ], 422);
        }

        // Check if invoice already exists for this order
        $existingFacture = Facture::where('idCommande', $commande->idCommande)->first();
        if ($existingFacture) {
            return response()->json([
                'message' => 'Une facture existe déjà pour cette commande.',
            ], 422);
        }

        try {
            $facture = DB::transaction(function () use ($commande, $validated) {
                // Calculate amounts
                $montantTTC = (float) $commande->montantTotal;
                // TVA at 10%: TTC = HT * 1.10, so HT = TTC / 1.10
                $montantHT = round($montantTTC / 1.10, 2);
                $montantTVA = round($montantTTC - $montantHT, 2);

                // Generate invoice number
                $numeroFacture = 'FAC-' . date('Y') . '-' . str_pad(
                    Facture::count() + 1,
                    5,
                    '0',
                    STR_PAD_LEFT
                );

                // Create the invoice
                $facture = Facture::create([
                    'numeroFacture' => $numeroFacture,
                    'dateFacture' => now(),
                    'montantHT' => $montantHT,
                    'montantTVA' => $montantTVA,
                    'montantTTC' => $montantTTC,
                    'modePaiement' => $validated['mode_paiement'],
                    'idCommande' => $commande->idCommande,
                ]);

                // Update order status to "facturee"
                $commande->update([
                    'statut' => 'facturee',
                ]);

                // Set table status to "libre"
                TableRestaurant::where('idTable', $commande->idTable)
                    ->update(['statut' => 'libre']);

                return $facture;
            });

            // Load relationships for response
            $facture->load('commande.lignesCommande.article', 'commande.tableRestaurant');

            return response()->json([
                'id' => $facture->idFacture,
                'numero_facture' => $facture->numeroFacture,
                'date_facture' => $facture->dateFacture->toIso8601String(),
                'montant_ht' => (float) $facture->montantHT,
                'montant_tva' => (float) $facture->montantTVA,
                'montant_ttc' => (float) $facture->montantTTC,
                'mode_paiement' => $facture->modePaiement,
                'commande' => [
                    'id' => $facture->commande->idCommande,
                    'table_numero' => $facture->commande->tableRestaurant->numeroTable ?? null,
                    'statut' => $facture->commande->statut,
                    'lignes' => $facture->commande->lignesCommande->map(function ($ligne) {
                        return [
                            'id' => $ligne->idLigne,
                            'article_nom' => $ligne->article->nom ?? 'Article inconnu',
                            'quantite' => $ligne->quantite,
                            'prix_unitaire' => (float) $ligne->prixUnitaire,
                            'sous_total' => (float) $ligne->sousTotal,
                        ];
                    }),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la facture.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * S-B5: Retrieve invoice details for printing.
     * GET /api/factures/{id}
     */
    public function show(int $id): JsonResponse
    {
        $facture = Facture::with(['commande.lignesCommande.article', 'commande.tableRestaurant'])
            ->find($id);

        if (!$facture) {
            return response()->json([
                'message' => 'Facture non trouvée.',
            ], 404);
        }

        return response()->json([
            'id' => $facture->idFacture,
            'numero_facture' => $facture->numeroFacture,
            'date_facture' => $facture->dateFacture->toIso8601String(),
            'montant_ht' => (float) $facture->montantHT,
            'montant_tva' => (float) $facture->montantTVA,
            'montant_ttc' => (float) $facture->montantTTC,
            'mode_paiement' => $facture->modePaiement,
            'commande' => [
                'id' => $facture->commande->idCommande,
                'table_numero' => $facture->commande->tableRestaurant->numeroTable ?? null,
                'couverts' => $facture->commande->tableRestaurant->couverts ?? null,
                'statut' => $facture->commande->statut,
                'date_commande' => $facture->commande->dateCommande->toIso8601String(),
                'lignes' => $facture->commande->lignesCommande->map(function ($ligne) {
                    return [
                        'id' => $ligne->idLigne,
                        'article_nom' => $ligne->article->nom ?? 'Article inconnu',
                        'quantite' => $ligne->quantite,
                        'prix_unitaire' => (float) $ligne->prixUnitaire,
                        'sous_total' => (float) $ligne->sousTotal,
                    ];
                }),
            ],
        ]);
    }
}
