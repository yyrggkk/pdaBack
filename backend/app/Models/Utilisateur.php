<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
