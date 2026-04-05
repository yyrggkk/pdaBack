<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Routes publiques (non protégées)
Route::post('/login', [AuthController::class, 'login']);

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
