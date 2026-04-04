<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LigneCommande extends Model
{
    use HasFactory;

    protected $table = 'ligne_commandes';

    protected $primaryKey = 'idLigne';

    public $timestamps = false;

    protected $fillable = [
        'quantite',
        'prixUnitaire',
        'sousTotal',
        'commentaire',
        'idCommande',
        'idArticle',
    ];

    protected $casts = [
        'prixUnitaire' => 'decimal:2',
        'sousTotal' => 'decimal:2',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'idCommande', 'idCommande');
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'idArticle', 'idArticle');
    }
}
