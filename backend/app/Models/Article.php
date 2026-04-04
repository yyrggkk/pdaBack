<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    use HasFactory;

    protected $table = 'articles';

    protected $primaryKey = 'idArticle';

    public $timestamps = false;

    protected $fillable = [
        'nom',
        'description',
        'prix',
        'disponible',
        'image',
        'idCategorie',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'disponible' => 'boolean',
    ];

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'idCategorie', 'idCategorie');
    }

    public function lignesCommande(): HasMany
    {
        return $this->hasMany(LigneCommande::class, 'idArticle', 'idArticle');
    }

    public function commandes(): BelongsToMany
    {
        return $this->belongsToMany(
            Commande::class,
            'ligne_commandes',
            'idArticle',
            'idCommande',
            'idArticle',
            'idCommande'
        )->withPivot(['idLigne', 'quantite', 'prixUnitaire', 'sousTotal', 'commentaire']);
    }
}
