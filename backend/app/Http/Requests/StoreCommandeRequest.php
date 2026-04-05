<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreCommandeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'table_id' => 'required|integer|exists:table_restaurants,idTable',
            'couverts' => 'required|integer|min:1',
            'utilisateur_id' => 'required|integer|exists:utilisateurs,idUtilisateur',
            'lignes' => 'required|array|min:1',
            'lignes.*.article_id' => 'required|integer|exists:articles,idArticle',
            'lignes.*.quantite' => 'required|integer|min:1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'table_id.required' => 'La table est obligatoire.',
            'table_id.exists' => 'La table sélectionnée n\'existe pas.',
            'couverts.required' => 'Le nombre de couverts est obligatoire.',
            'couverts.min' => 'Le nombre de couverts doit être au moins 1.',
            'utilisateur_id.required' => 'L\'utilisateur est obligatoire.',
            'utilisateur_id.exists' => 'L\'utilisateur sélectionné n\'existe pas.',
            'lignes.required' => 'La commande doit contenir au moins un article.',
            'lignes.min' => 'La commande doit contenir au moins un article.',
            'lignes.*.article_id.required' => 'L\'article est obligatoire pour chaque ligne.',
            'lignes.*.article_id.exists' => 'Un des articles sélectionnés n\'existe pas.',
            'lignes.*.quantite.required' => 'La quantité est obligatoire pour chaque ligne.',
            'lignes.*.quantite.min' => 'La quantité doit être au moins 1.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
