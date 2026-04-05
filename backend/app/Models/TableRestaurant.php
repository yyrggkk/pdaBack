<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TableRestaurant extends Model
{
    use HasFactory;

    protected $table = 'table_restaurants';

    protected $primaryKey = 'idTable';

    public $timestamps = false;

    protected $fillable = [
        'numeroTable',
        'nombreDePlaces',
        'statut',
        'couverts',
    ];

    protected $casts = [
        'nombreDePlaces' => 'integer',
        'couverts' => 'integer',
    ];

    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class, 'idTable', 'idTable');
    }
}
