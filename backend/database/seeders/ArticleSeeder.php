<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Categorie;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menu = [
            'Entrees Marocaines' => [
                ['nom' => 'Zaalouk', 'prix' => 28.00],
                ['nom' => 'Taktouka', 'prix' => 26.00],
                ['nom' => 'Briouates au fromage', 'prix' => 34.00],
                ['nom' => 'Harira', 'prix' => 30.00],
                ['nom' => 'Salade marocaine', 'prix' => 24.00],
            ],
            'Tajines' => [
                ['nom' => 'Tajine poulet citron olives', 'prix' => 78.00],
                ['nom' => 'Tajine kefta oeufs', 'prix' => 72.00],
                ['nom' => 'Tajine agneau pruneaux', 'prix' => 92.00],
                ['nom' => 'Tajine legumes de saison', 'prix' => 68.00],
                ['nom' => 'Tajine poisson chermoula', 'prix' => 88.00],
            ],
            'Couscous' => [
                ['nom' => 'Couscous royal', 'prix' => 95.00],
                ['nom' => 'Couscous tfaya', 'prix' => 84.00],
                ['nom' => 'Couscous poulet', 'prix' => 79.00],
                ['nom' => 'Couscous legumes', 'prix' => 70.00],
            ],
            'Grillades' => [
                ['nom' => 'Brochettes kefta', 'prix' => 74.00],
                ['nom' => 'Brochettes poulet', 'prix' => 69.00],
                ['nom' => 'Cotelettes d agneau', 'prix' => 108.00],
                ['nom' => 'Mix grill maison', 'prix' => 118.00],
            ],
            'Patisseries' => [
                ['nom' => 'Corne de gazelle', 'prix' => 18.00],
                ['nom' => 'Chebakia', 'prix' => 20.00],
                ['nom' => 'Sellou', 'prix' => 22.00],
                ['nom' => 'M hancha aux amandes', 'prix' => 27.00],
            ],
            'Boissons Chaudes' => [
                ['nom' => 'The a la menthe', 'prix' => 16.00],
                ['nom' => 'Cafe noir', 'prix' => 14.00],
                ['nom' => 'Cafe nous-nous', 'prix' => 17.00],
                ['nom' => 'Verveine', 'prix' => 15.00],
            ],
            'Jus Frais' => [
                ['nom' => 'Jus d orange', 'prix' => 19.00],
                ['nom' => 'Jus avocat amandes', 'prix' => 32.00],
                ['nom' => 'Jus panache', 'prix' => 29.00],
                ['nom' => 'Citronnade maison', 'prix' => 18.00],
            ],
            'Boissons Froides' => [
                ['nom' => 'Eau minerale 50cl', 'prix' => 10.00],
                ['nom' => 'Eau gazeuse', 'prix' => 12.00],
                ['nom' => 'Soda cola', 'prix' => 14.00],
                ['nom' => 'Soda citron', 'prix' => 14.00],
            ],
        ];

        foreach ($menu as $libelleCategorie => $articles) {
            $categorie = Categorie::query()->where('libelle', $libelleCategorie)->first();

            if (! $categorie) {
                continue;
            }

            foreach ($articles as $article) {
                $imagePath = $this->generateFakeImage($libelleCategorie, $article['nom']);

                Article::query()->updateOrCreate(
                    [
                        'nom' => $article['nom'],
                        'idCategorie' => $categorie->idCategorie,
                    ],
                    [
                        'description' => 'Recette maison inspiree de la cuisine marocaine.',
                        'prix' => $article['prix'],
                        'disponible' => true,
                        'image' => 'storage/' . $imagePath,
                    ]
                );
            }
        }

        // Quelques indisponibilites temporaires pour realisme.
        Article::query()->inRandomOrder()->limit(3)->update(['disponible' => false]);
    }

    private function generateFakeImage(string $categorie, string $nomArticle): string
    {
        $slug = Str::slug($categorie . '-' . $nomArticle);
        $path = 'articles/' . $slug . '.svg';
        $svg = $this->buildSvgPlaceholder($categorie, $nomArticle);

        Storage::disk('public')->put($path, $svg);

        return $path;
    }

    private function buildSvgPlaceholder(string $categorie, string $nomArticle): string
    {
        $palettes = [
            ['#9C6644', '#DDB892'],
            ['#7F5539', '#E6CCB2'],
            ['#6B705C', '#A5A58D'],
            ['#3D405B', '#81B29A'],
            ['#BC6C25', '#DDA15E'],
            ['#283618', '#606C38'],
        ];

        $index = abs(crc32($nomArticle)) % count($palettes);
        [$start, $end] = $palettes[$index];

        $safeNom = htmlspecialchars($nomArticle, ENT_QUOTES, 'UTF-8');
        $safeCategorie = htmlspecialchars($categorie, ENT_QUOTES, 'UTF-8');

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="{$safeNom}">
    <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="{$start}" />
            <stop offset="100%" stop-color="{$end}" />
        </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)" />
    <circle cx="220" cy="180" r="140" fill="rgba(255,255,255,0.12)" />
    <circle cx="980" cy="620" r="170" fill="rgba(255,255,255,0.10)" />
    <rect x="110" y="510" width="980" height="170" rx="28" fill="rgba(0,0,0,0.25)" />
    <text x="600" y="595" text-anchor="middle" fill="#FFFFFF" font-size="62" font-family="Georgia, serif" font-weight="700">{$safeNom}</text>
    <text x="600" y="640" text-anchor="middle" fill="#F8F8F8" font-size="30" font-family="Georgia, serif">{$safeCategorie}</text>
    <text x="600" y="732" text-anchor="middle" fill="#F0F0F0" font-size="24" font-family="Verdana, sans-serif">Image factice generee automatiquement</text>
</svg>
SVG;
    }
}
