<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TableRestaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class TableController extends Controller
{
    public function index(): JsonResponse
    {
        $tables = TableRestaurant::query()
            ->orderBy('numeroTable')
            ->get()
            ->map(fn(TableRestaurant $table) => $this->formatTable($table));

        return response()->json($tables);
    }

    public function show(int $id): JsonResponse
    {
        $table = TableRestaurant::query()->findOrFail($id);

        $commandeEnCours = $table->commandes()
            ->whereIn('statut', ['en_cours', 'valide', 'en_preparation', 'servie'])
            ->with(['lignesCommande.article'])
            ->orderByDesc('idCommande')
            ->first();

        return response()->json([
            ...$this->formatTable($table),
            'commandeEnCours' => $commandeEnCours ? [
                'id' => $commandeEnCours->idCommande,
                'dateCommande' => $commandeEnCours->dateCommande,
                'statut' => $commandeEnCours->statut,
                'montantTotal' => (float) $commandeEnCours->montantTotal,
                'lignes' => $commandeEnCours->lignesCommande->map(fn($ligne) => [
                    'id' => $ligne->idLigne,
                    'quantite' => $ligne->quantite,
                    'prixUnitaire' => (float) $ligne->prixUnitaire,
                    'sousTotal' => (float) $ligne->sousTotal,
                    'commentaire' => $ligne->commentaire,
                    'article' => [
                        'id' => $ligne->article?->idArticle,
                        'nom' => $ligne->article?->nom,
                    ],
                ])->values(),
            ] : null,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $table = TableRestaurant::query()->findOrFail($id);

        $validated = $request->validate([
            'statut' => ['sometimes', 'string', Rule::in(['libre', 'occupe', 'occupee', 'servie'])],
            'couverts' => ['sometimes', 'integer', 'min:0'],
        ]);

        if ($validated === []) {
            return response()->json([
                'message' => 'Aucune donnee a mettre a jour.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $newStatut = $validated['statut'] ?? null;
        if ($newStatut === 'occupee') {
            $newStatut = 'occupe';
        }

        if ($newStatut !== null && $newStatut !== $table->statut) {
            $allowedTransitions = [
                'libre' => 'occupe',
                'occupe' => 'servie',
                'servie' => 'libre',
            ];

            $expectedNext = $allowedTransitions[$table->statut] ?? null;

            if ($expectedNext !== $newStatut) {
                return response()->json([
                    'message' => 'Transition de statut invalide.',
                    'expectedNext' => $expectedNext === 'occupe' ? 'occupee' : $expectedNext,
                    'current' => $this->statusForApi($table->statut),
                    'received' => $this->statusForApi($newStatut),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $newCouverts = $validated['couverts'] ?? $table->couverts;

        if ($newCouverts > $table->nombreDePlaces) {
            return response()->json([
                'message' => 'Le nombre de couverts ne peut pas depasser le nombre de places.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $nextStatus = $newStatut ?? $table->statut;

        if ($nextStatus === 'libre' && $newCouverts > 0) {
            return response()->json([
                'message' => 'Une table libre doit avoir 0 couvert.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (array_key_exists('statut', $validated)) {
            $table->statut = $newStatut;
            if ($newStatut === 'libre') {
                $newCouverts = 0;
            }
        }

        if (array_key_exists('couverts', $validated) || ($newStatut === 'libre')) {
            $table->couverts = $newCouverts;
        }

        $table->save();

        return response()->json($this->formatTable($table));
    }

    private function formatTable(TableRestaurant $table): array
    {
        return [
            'id' => $table->idTable,
            'numero' => $table->numeroTable,
            'statut' => $this->statusForApi($table->statut),
            'nombreDePlaces' => $table->nombreDePlaces,
            'couverts' => $table->couverts,
        ];
    }

    private function statusForApi(string $status): string
    {
        return $status === 'occupe' ? 'occupee' : $status;
    }
}
