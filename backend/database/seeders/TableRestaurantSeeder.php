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
        $tables = [];

        for ($numero = 1; $numero <= 18; $numero++) {
            $places = match (true) {
                $numero <= 6 => 2,
                $numero <= 14 => 4,
                $numero <= 17 => 6,
                default => 8,
            };

            $tables[] = [
                'numeroTable' => $numero,
                'nombreDePlaces' => $places,
                'statut' => 'libre',
            ];
        }

        // Une table indisponible pour maintenance.
        $tables[16]['statut'] = 'indisponible';

        foreach ($tables as $table) {
            TableRestaurant::query()->updateOrCreate(
                ['numeroTable' => $table['numeroTable']],
                $table
            );
        }
    }
}
