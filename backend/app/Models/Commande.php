<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Commande extends Model
{
    use HasFactory;

    protected $table = 'commandes';

    protected $primaryKey = 'idCommande';

    public $timestamps = false;

    protected $fillable = [
        'dateCommande',
        'statut',
        'montantTotal',
        'couverts',
        'idTable',
        'idUtilisateur',
    ];

    protected $casts = [
        'dateCommande' => 'datetime',
        'montantTotal' => 'decimal:2',
    ];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function tableRestaurant(): BelongsTo
    {
        return $this->belongsTo(TableRestaurant::class, 'idTable', 'idTable');
    }

    public function lignesCommande(): HasMany
    {
        return $this->hasMany(LigneCommande::class, 'idCommande', 'idCommande');
    }

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(
            Article::class,
            'ligne_commandes',
            'idCommande',
            'idArticle',
            'idCommande',
            'idArticle'
        )->withPivot(['idLigne', 'quantite', 'prixUnitaire', 'sousTotal', 'commentaire']);
    }

    public function facture(): HasOne
    {
        return $this->hasOne(Facture::class, 'idCommande', 'idCommande');
    }
}
