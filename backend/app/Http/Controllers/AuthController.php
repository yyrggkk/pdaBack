<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Tâche M-B1 : Connexion (Login)
     */
    public function login(Request $request)
    {
        $request->validate([
            'pin' => 'required|integer',
        ]);

        // Recherche de l'utilisateur par son PIN
        $utilisateur = Utilisateur::where('PIN', $request->pin)->first();

        // Vérification de l'existence et du statut
        if (!$utilisateur || $utilisateur->statut !== 'actif') {
            return response()->json([
                'message' => 'Identifiants invalides ou compte inactif.'
            ], 401);
        }

        // Création du token Sanctum
        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => [
                'id' => $utilisateur->idUtilisateur,
                'nom' => $utilisateur->nomComplet,
                'role' => $utilisateur->role,
            ]
        ], 200);
    }

    /**
     * Tâche M-B3 : Déconnexion (Logout)
     */
    public function logout(Request $request)
    {
        // Révocation du token actuel (celui qui a servi à s'authentifier)
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ], 200);
    }
}
