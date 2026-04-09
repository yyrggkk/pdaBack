<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Categorie;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menu = [
            'Mains' => [
                ['nom' => 'Signature Smokehouse Burger', 'prix' => 18.50, 'disponible' => true, 'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1sC2FvMVa1jqH2pNzJzlZP-UIJMbaAaeu4HhqT7pj0SXfPfWex_BxUXaB-TLjmNr1zfYHqN62dHeq5BcB89Y65GlQLIjfQkoGv1iJfGc0HgbUoIH5PYzudlvShbMG0y1hyOmheQiggZBf3oC3isE5j41nHs1lV8JpzpzMSwtr2vE_ht6jwuKHBUrpRTwfWP5KF4YBdaE35Hmlw9YKbREY8SZfTusA_nOEsgphkGop_4P2TlVy_dzNT9o7q-c3LJ_oEjplbTh8WFQ'],
                ['nom' => 'Wild Atlantic Salmon', 'prix' => 24.00, 'disponible' => true, 'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqSlljLniBwvB5ArKRIKWfBm3KM6b7HZia5Z4aLfqdW5JWsABGNMQLZG3LYfNn6AvkixATUg8DEupvUEmu9YXTitOuOXO0fat28IXwevTpvt4xA1aKcKc7QshRLSyIUHHJt7Ot2QfZLqASQ5iBx5_qnyuHT_zrLz1fE-ui0Fa2HaWRJMH9Oqt-Zc0GL6Uc5EaVbGmaOJu_EpPrHQgXp0sHj0lt2b_dhaCgItVYGD5Z_xW2ZxUf6vauOY2cdhFBSpHmuU5NuyBj2Q8'],
                ['nom' => 'Black Truffle Tagliatelle', 'prix' => 22.00, 'disponible' => false, 'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5XjQUg7zeXcMv-EJ1JG1SYFwfYe_M-Zb6pC85Re14vr7bULP2LeaN_TR66rOjWY12l1jn9VhF0Se6p0cICpuO7KsE4rU8ANJ3-FA-mnAqzKoQovq_o-ZvuhK9aUqmxG8nQFpDDfKXJn6ggG1oFIp3sPuw466_X1k1TVMJ0rHk_RI8VcAWkYKthc-VxaIQPqf1i4acdj8QVZzfOo5zKIaMj7uelFhOEKieHbThhhYmJFGn-Iq2KiE6E3Kpr01RbtZhu3cdiHiwcF0'],
                ['nom' => 'Roasted Heritage Chicken', 'prix' => 19.50, 'disponible' => true, 'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFicAGwCAjA3i_vW1FSEgbgKugZ32MEI7wrf4CM84dHFbtIfX9VwLXNJ8exM0Z9nWkARN6uwzbIhbKXNKI-DiCOT7jNhyqM1uC1heeq3Tl8dWcuYBBetXDJiCjNEes7TtHLYbwZ9tEg2g4QX95uXFz_yXIb4Smr7f_KXNw5bpdR5mhMsNv1xlJy6JLq4QMczP1IG5RbuOsSXvj35hdan0FsfYj3EORJaL5xCrmwhZMT1CdaVM01-JbyMTPJ7tE1Ulz7P2VgR7oaDI'],
                ['nom' => 'Entrecote Grillee', 'prix' => 26.00, 'disponible' => true, 'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'],
            ],
            'Starters' => [
                ['nom' => 'Carpaccio de Boeuf', 'prix' => 12.00, 'disponible' => true, 'image' => 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=900&q=80'],
                ['nom' => 'Veloute de Champignons', 'prix' => 9.50, 'disponible' => true, 'image' => 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'],
            ],
            'Sides' => [
                ['nom' => 'Pommes Rissolees', 'prix' => 7.00, 'disponible' => true, 'image' => 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=900&q=80'],
                ['nom' => 'Legumes Grilles', 'prix' => 8.50, 'disponible' => true, 'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80'],
            ],
            'Desserts' => [
                ['nom' => 'Fondant Chocolat', 'prix' => 10.00, 'disponible' => true, 'image' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80'],
                ['nom' => 'Tarte Citron', 'prix' => 9.00, 'disponible' => false, 'image' => 'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=900&q=80'],
                ['nom' => 'Cafe Gourmand', 'prix' => 9.00, 'disponible' => true, 'image' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80'],
            ],
        ];

        foreach ($menu as $libelleCategorie => $articles) {
            $categorie = Categorie::query()->where('libelle', $libelleCategorie)->first();

            if (! $categorie) {
                continue;
            }

            foreach ($articles as $article) {
                Article::query()->updateOrCreate(
                    [
                        'nom' => $article['nom'],
                        'idCategorie' => $categorie->idCategorie,
                    ],
                    [
                        'description' => 'Recette maison inspirée de la cuisine marocaine.',
                        'prix' => $article['prix'],
                        'disponible' => $article['disponible'],
                        'image' => isset($article['image']) ? mb_substr($article['image'], 0, 255) : null,
                    ]
                );
            }
        }
    }
}
