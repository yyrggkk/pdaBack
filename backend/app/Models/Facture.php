<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Facture extends Model
{
    use HasFactory;

    protected $table = 'factures';

    protected $primaryKey = 'idFacture';

    public $timestamps = false;

    protected $fillable = [
        'numeroFacture',
        'dateFacture',
        'montantHT',
        'montantTVA',
        'montantTTC',
        'modePaiement',
        'idCommande',
    ];

    protected $casts = [
        'dateFacture' => 'datetime',
        'montantHT' => 'decimal:2',
        'montantTVA' => 'decimal:2',
        'montantTTC' => 'decimal:2',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'idCommande', 'idCommande');
    }
}
