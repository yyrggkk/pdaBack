<?php

namespace Database\Factories;

use App\Models\TableRestaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TableRestaurant>
 */
class TableRestaurantFactory extends Factory
{
    protected $model = TableRestaurant::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'numeroTable' => $this->faker->unique()->numberBetween(1, 200),
            'nombreDePlaces' => $this->faker->randomElement([2, 2, 4, 4, 6, 8]),
            'statut' => $this->faker->randomElement(['libre', 'libre', 'occupe', 'servie', 'indisponible']),
        ];
    }
}
