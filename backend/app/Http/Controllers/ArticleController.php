<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\JsonResponse;

class ArticleController extends Controller
{
    /**
     * Get details of a single article.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $article = Article::with('categorie')->find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Article non trouvé',
            ], 404);
        }

        return response()->json([
            'id' => $article->idArticle,
            'nom' => $article->nom,
            'prix' => (float) $article->prix,
            'description' => $article->description,
            'disponibilite' => $article->disponible,
            'image_url' => $article->image,
            'category' => [
                'id' => $article->categorie->idCategorie,
                'nom' => $article->categorie->libelle,
            ],
        ], 200);
    }
}
