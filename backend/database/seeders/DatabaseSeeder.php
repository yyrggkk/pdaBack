<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('factures')->truncate();
        DB::table('ligne_commandes')->truncate();
        DB::table('commandes')->truncate();
        DB::table('articles')->truncate();
        DB::table('categories')->truncate();
        DB::table('table_restaurants')->truncate();
        DB::table('personal_access_tokens')->truncate();
        DB::table('utilisateurs')->truncate();
        Schema::enableForeignKeyConstraints();

        $this->call([
            UtilisateurSeeder::class,
            CategorieSeeder::class,
            ArticleSeeder::class,
            TableRestaurantSeeder::class,
        ]);
    }
}
