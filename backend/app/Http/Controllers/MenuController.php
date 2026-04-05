<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    /**
     * Get all menu categories with their nested articles.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $categories = Categorie::with('articles')->get();

        $formattedCategories = $categories->map(function ($categorie) {
            return [
                'id' => $categorie->idCategorie,
                'nom' => $categorie->libelle,
                'articles' => $categorie->articles->map(function ($article) {
                    return [
                        'id' => $article->idArticle,
                        'nom' => $article->nom,
                        'prix' => (float) $article->prix,
                        'description' => $article->description,
                        'disponibilite' => $article->disponible,
                        'image_url' => $article->image,
                    ];
                }),
            ];
        });

        return response()->json([
            'categories' => $formattedCategories,
        ], 200);
    }
}
