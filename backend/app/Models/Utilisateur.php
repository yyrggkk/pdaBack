<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Utilisateur extends Model
{
    use HasFactory;

    protected $table = 'utilisateurs';

    protected $primaryKey = 'idUtilisateur';

    public $timestamps = false;

    protected $fillable = [
        'PIN',
        'nomComplet',
        'statut',
        'role',
    ];

    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class, 'idUtilisateur', 'idUtilisateur');
    }
}
