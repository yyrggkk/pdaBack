<?php

use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Routes publiques (non protégées)
Route::get('/menu', [MenuController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);
Route::post('/commandes', [CommandeController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);

// S-B1: Liste des commandes (avec filtre par statut)
Route::get('/commandes', [CommandeController::class, 'index']);

// S-B2: Mise à jour du statut d'une commande
Route::patch('/commandes/{id}/status', [CommandeController::class, 'updateStatus'])->whereNumber('id');

// S-B3: Génération de facture
Route::post('/factures', [FactureController::class, 'store']);

// S-B5: Détails d'une facture
Route::get('/factures/{id}', [FactureController::class, 'show'])->whereNumber('id');

// Routes Plan des tables
Route::get('/tables', [TableController::class, 'index']);
Route::get('/tables/{id}', [TableController::class, 'show'])->whereNumber('id');
Route::patch('/tables/{id}', [TableController::class, 'update'])->whereNumber('id');

// Routes privées (requièrent un token Sanctum valide)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Tâche M-B3 : Déconnexion (Logout)
    Route::post('/logout', [AuthController::class, 'logout']);

    // Tâche M-B2 : Exemple de protection par rôle personnalisé "CheckRole"
    // Uniquement pour les serveurs
    Route::middleware('role:serveur')->group(function () {
        // Route::post('/commandes', [CommandeController::class, 'store']);
    });

    // Uniquement pour les cuisiniers
    Route::middleware('role:cuisinier')->group(function () {
        // Route::patch('/commandes/{id}/statut', [CommandeController::class, 'changerStatut']);
    });
});
