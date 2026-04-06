<?php

namespace Database\Seeders;

use App\Models\TableRestaurant;
use Illuminate\Database\Seeder;

class TableRestaurantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [
            ['numeroTable' => 1, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 2, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 3, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 4, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 5, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 8, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 12, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 14, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 15, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 16, 'nombreDePlaces' => 4, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 21, 'nombreDePlaces' => 6, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 22, 'nombreDePlaces' => 6, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 23, 'nombreDePlaces' => 6, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 24, 'nombreDePlaces' => 6, 'statut' => 'libre', 'couverts' => 0],
            ['numeroTable' => 25, 'nombreDePlaces' => 8, 'statut' => 'libre', 'couverts' => 0],
        ];

        foreach ($tables as $table) {
            TableRestaurant::query()->updateOrCreate(
                ['numeroTable' => $table['numeroTable']],
                $table
            );
        }
    }
}
