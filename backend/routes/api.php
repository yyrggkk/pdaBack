<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Routes publiques (non protégées)
// Example : Route::post('/login', [AuthController::class, 'login']);
// Example : Route::post('/register', [AuthController::class, 'register']);

// Routes privées (requièrent un token Sanctum valide)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Vos routes PDA...
    // Route::get('/demandes', [DemandeController::class, 'index']);
    // Route::post('/logout', [AuthController::class, 'logout']);
});
