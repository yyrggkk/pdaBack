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
        $nombreDePlaces = $this->faker->randomElement([2, 2, 4, 4, 6, 8]);
        $statut = $this->faker->randomElement(['libre', 'libre', 'occupe', 'servie', 'indisponible']);

        return [
            'numeroTable' => $this->faker->unique()->numberBetween(1, 200),
            'nombreDePlaces' => $nombreDePlaces,
            'statut' => $statut,
            'couverts' => in_array($statut, ['occupe', 'servie'], true)
                ? $this->faker->numberBetween(1, $nombreDePlaces)
                : 0,
        ];
    }
}
