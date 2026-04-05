<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Categorie;
use Illuminate\Database\Seeder;
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
                ['nom' => 'Zaalouk', 'prix' => 28.00, 'image' => 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop'],
                ['nom' => 'Taktouka', 'prix' => 26.00, 'image' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop'],
                ['nom' => 'Briouates fromage', 'prix' => 34.00, 'image' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop'],
                ['nom' => 'Harira', 'prix' => 30.00, 'image' => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop'],
                ['nom' => 'Salade marocaine', 'prix' => 24.00, 'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop'],
                ['nom' => 'Pastilla poulet', 'prix' => 45.00, 'image' => 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop'],
                ['nom' => 'Soupe légumes', 'prix' => 22.00, 'image' => 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&h=400&fit=crop'],
                ['nom' => 'Bissara', 'prix' => 18.00, 'image' => 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&h=400&fit=crop'],
            ],
            'Tajines' => [
                ['nom' => 'Tajine poulet olives', 'prix' => 78.00, 'image' => 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop'],
                ['nom' => 'Tajine kefta oeufs', 'prix' => 72.00, 'image' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop'],
                ['nom' => 'Tajine agneau pruneaux', 'prix' => 92.00, 'image' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop'],
                ['nom' => 'Tajine légumes', 'prix' => 68.00, 'image' => 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&h=400&fit=crop'],
                ['nom' => 'Tajine poisson', 'prix' => 88.00, 'image' => 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop'],
                ['nom' => 'Tajine boeuf carottes', 'prix' => 85.00, 'image' => 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop'],
                ['nom' => 'Tajine mrouzia', 'prix' => 98.00, 'image' => 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=400&fit=crop'],
                ['nom' => 'Tajine crevettes', 'prix' => 95.00, 'image' => 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&h=400&fit=crop'],
            ],
            'Couscous' => [
                ['nom' => 'Couscous royal', 'prix' => 95.00, 'image' => 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop'],
                ['nom' => 'Couscous tfaya', 'prix' => 84.00, 'image' => 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=400&h=400&fit=crop'],
                ['nom' => 'Couscous poulet', 'prix' => 79.00, 'image' => 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=400&fit=crop'],
                ['nom' => 'Couscous légumes', 'prix' => 70.00, 'image' => 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&h=400&fit=crop'],
                ['nom' => 'Couscous agneau', 'prix' => 89.00, 'image' => 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop'],
                ['nom' => 'Couscous merguez', 'prix' => 82.00, 'image' => 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=400&fit=crop'],
            ],
            'Grillades' => [
                ['nom' => 'Brochettes kefta', 'prix' => 74.00, 'image' => 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=400&fit=crop'],
                ['nom' => 'Brochettes poulet', 'prix' => 69.00, 'image' => 'https://images.unsplash.com/photo-1532636875304-0c89f6d6e6cd?w=400&h=400&fit=crop'],
                ['nom' => 'Côtelettes agneau', 'prix' => 108.00, 'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop'],
                ['nom' => 'Mix grill maison', 'prix' => 118.00, 'image' => 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop'],
                ['nom' => 'Brochettes boeuf', 'prix' => 85.00, 'image' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop'],
                ['nom' => 'Poulet grillé', 'prix' => 75.00, 'image' => 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop'],
                ['nom' => 'Merguez grillées', 'prix' => 65.00, 'image' => 'https://images.unsplash.com/photo-1558030137-a56c1b004224?w=400&h=400&fit=crop'],
                ['nom' => 'Foie grillé', 'prix' => 55.00, 'image' => 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=400&fit=crop'],
            ],
            'Patisseries' => [
                ['nom' => 'Corne de gazelle', 'prix' => 18.00, 'image' => 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop'],
                ['nom' => 'Chebakia', 'prix' => 20.00, 'image' => 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=400&fit=crop'],
                ['nom' => 'Sellou', 'prix' => 22.00, 'image' => 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=400&fit=crop'],
                ['nom' => 'M\'hancha amandes', 'prix' => 27.00, 'image' => 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop'],
                ['nom' => 'Baklava', 'prix' => 25.00, 'image' => 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&h=400&fit=crop'],
                ['nom' => 'Briouates miel', 'prix' => 24.00, 'image' => 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400&h=400&fit=crop'],
                ['nom' => 'Ghriba coco', 'prix' => 16.00, 'image' => 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop'],
                ['nom' => 'Fekkas', 'prix' => 15.00, 'image' => 'https://images.unsplash.com/photo-1558303386-d9e9ccfb1df8?w=400&h=400&fit=crop'],
            ],
            'Boissons Chaudes' => [
                ['nom' => 'Thé à la menthe', 'prix' => 16.00, 'image' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'],
                ['nom' => 'Café noir', 'prix' => 14.00, 'image' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop'],
                ['nom' => 'Café nous-nous', 'prix' => 17.00, 'image' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop'],
                ['nom' => 'Verveine', 'prix' => 15.00, 'image' => 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=400&fit=crop'],
                ['nom' => 'Cappuccino', 'prix' => 22.00, 'image' => 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop'],
                ['nom' => 'Chocolat chaud', 'prix' => 20.00, 'image' => 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=400&fit=crop'],
            ],
            'Jus Frais' => [
                ['nom' => 'Jus d\'orange', 'prix' => 19.00, 'image' => 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop'],
                ['nom' => 'Jus avocat', 'prix' => 32.00, 'image' => 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=400&fit=crop'],
                ['nom' => 'Jus panaché', 'prix' => 29.00, 'image' => 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop'],
                ['nom' => 'Citronnade', 'prix' => 18.00, 'image' => 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400&h=400&fit=crop'],
                ['nom' => 'Jus pomme', 'prix' => 20.00, 'image' => 'https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=400&h=400&fit=crop'],
                ['nom' => 'Smoothie fruits', 'prix' => 35.00, 'image' => 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop'],
                ['nom' => 'Jus carotte', 'prix' => 22.00, 'image' => 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop'],
                ['nom' => 'Jus betterave', 'prix' => 24.00, 'image' => 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=400&fit=crop'],
            ],
            'Boissons Froides' => [
                ['nom' => 'Eau minérale 50cl', 'prix' => 10.00, 'image' => 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop'],
                ['nom' => 'Eau gazeuse', 'prix' => 12.00, 'image' => 'https://images.unsplash.com/photo-1603394630850-69a0c6c7e8e7?w=400&h=400&fit=crop'],
                ['nom' => 'Coca Cola', 'prix' => 14.00, 'image' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop'],
                ['nom' => 'Sprite', 'prix' => 14.00, 'image' => 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop'],
                ['nom' => 'Fanta', 'prix' => 14.00, 'image' => 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&h=400&fit=crop'],
                ['nom' => 'Ice Tea', 'prix' => 16.00, 'image' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'],
                ['nom' => 'Red Bull', 'prix' => 25.00, 'image' => 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&h=400&fit=crop'],
                ['nom' => 'Eau 1.5L', 'prix' => 15.00, 'image' => 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=400&fit=crop'],
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
                        'disponible' => true,
                        'image' => $article['image'],
                    ]
                );
            }
        }

        // Quelques indisponibilités temporaires pour réalisme.
        Article::query()->inRandomOrder()->limit(5)->update(['disponible' => false]);
    }
}
