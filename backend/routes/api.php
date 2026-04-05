<?php

use App\Http\Controllers\Api\TableController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/tables', [TableController::class, 'index']);
Route::get('/tables/{id}', [TableController::class, 'show'])->whereNumber('id');
Route::patch('/tables/{id}', [TableController::class, 'update'])->whereNumber('id');

// Routes privées (requièrent un token Sanctum valide)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
