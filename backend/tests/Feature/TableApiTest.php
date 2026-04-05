<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Categorie;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\TableRestaurant;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TableApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_tables_sorted_with_required_fields(): void
    {
        TableRestaurant::factory()->create([
            'numeroTable' => 10,
            'nombreDePlaces' => 4,
            'statut' => 'libre',
            'couverts' => 0,
        ]);

        TableRestaurant::factory()->create([
            'numeroTable' => 2,
            'nombreDePlaces' => 2,
            'statut' => 'occupe',
            'couverts' => 2,
        ]);

        $response = $this->getJson('/api/tables');

        $response->assertOk();
        $response->assertJsonCount(2);
        $response->assertJsonPath('0.numero', 2);
        $response->assertJsonPath('1.numero', 10);
        $response->assertJsonStructure([
            '*' => ['id', 'numero', 'statut', 'nombreDePlaces', 'couverts'],
        ]);
    }

    public function test_show_returns_table_details_with_current_order_when_exists(): void
    {
        $table = TableRestaurant::factory()->create([
            'numeroTable' => 5,
            'nombreDePlaces' => 4,
            'statut' => 'occupe',
            'couverts' => 3,
        ]);

        $serveur = Utilisateur::factory()->create([
            'role' => 'serveur',
            'statut' => 'actif',
        ]);

        $categorie = Categorie::factory()->create(['libelle' => 'Test']);
        $article = Article::factory()->create([
            'idCategorie' => $categorie->idCategorie,
            'prix' => 42.00,
            'disponible' => true,
        ]);

        $commande = Commande::factory()->create([
            'idTable' => $table->idTable,
            'idUtilisateur' => $serveur->idUtilisateur,
            'statut' => 'en_preparation',
            'montantTotal' => 84,
        ]);

        LigneCommande::factory()->create([
            'idCommande' => $commande->idCommande,
            'idArticle' => $article->idArticle,
            'quantite' => 2,
            'prixUnitaire' => 42,
            'sousTotal' => 84,
            'commentaire' => 'Sans piment',
        ]);

        $response = $this->getJson('/api/tables/' . $table->idTable);

        $response->assertOk();
        $response->assertJsonPath('id', $table->idTable);
        $response->assertJsonPath('numero', 5);
        $response->assertJsonPath('commandeEnCours.id', $commande->idCommande);
        $response->assertJsonPath('commandeEnCours.lignes.0.article.nom', $article->nom);
    }

    public function test_patch_updates_status_and_couverts_with_valid_transition(): void
    {
        $table = TableRestaurant::factory()->create([
            'statut' => 'libre',
            'nombreDePlaces' => 4,
            'couverts' => 0,
        ]);

        $response = $this->patchJson('/api/tables/' . $table->idTable, [
            'statut' => 'occupee',
            'couverts' => 3,
        ]);

        $response->assertOk();
        $response->assertJsonPath('statut', 'occupee');
        $response->assertJsonPath('couverts', 3);

        $this->assertDatabaseHas('table_restaurants', [
            'idTable' => $table->idTable,
            'statut' => 'occupe',
            'couverts' => 3,
        ]);
    }

    public function test_patch_rejects_invalid_status_transition(): void
    {
        $table = TableRestaurant::factory()->create([
            'statut' => 'libre',
            'nombreDePlaces' => 4,
            'couverts' => 0,
        ]);

        $response = $this->patchJson('/api/tables/' . $table->idTable, [
            'statut' => 'servie',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('message', 'Transition de statut invalide.');
    }

    public function test_patch_rejects_couverts_above_places(): void
    {
        $table = TableRestaurant::factory()->create([
            'statut' => 'occupe',
            'nombreDePlaces' => 2,
            'couverts' => 1,
        ]);

        $response = $this->patchJson('/api/tables/' . $table->idTable, [
            'couverts' => 3,
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('message', 'Le nombre de couverts ne peut pas depasser le nombre de places.');
    }

    public function test_patch_couverts_only_auto_sets_status_to_occupee_when_incrementing_from_libre(): void
    {
        $table = TableRestaurant::factory()->create([
            'statut' => 'libre',
            'nombreDePlaces' => 4,
            'couverts' => 0,
        ]);

        $response = $this->patchJson('/api/tables/' . $table->idTable, [
            'couverts' => 2,
        ]);

        $response->assertOk();
        $response->assertJsonPath('statut', 'occupee');
        $response->assertJsonPath('couverts', 2);

        $this->assertDatabaseHas('table_restaurants', [
            'idTable' => $table->idTable,
            'statut' => 'occupe',
            'couverts' => 2,
        ]);
    }

    public function test_patch_couverts_only_auto_sets_status_to_libre_when_decrementing_to_zero(): void
    {
        $table = TableRestaurant::factory()->create([
            'statut' => 'occupe',
            'nombreDePlaces' => 4,
            'couverts' => 1,
        ]);

        $response = $this->patchJson('/api/tables/' . $table->idTable, [
            'couverts' => 0,
        ]);

        $response->assertOk();
        $response->assertJsonPath('statut', 'libre');
        $response->assertJsonPath('couverts', 0);

        $this->assertDatabaseHas('table_restaurants', [
            'idTable' => $table->idTable,
            'statut' => 'libre',
            'couverts' => 0,
        ]);
    }

    public function test_show_marks_couverts_as_locked_when_table_has_at_least_one_commande(): void
    {
        $table = TableRestaurant::factory()->create([
            'statut' => 'occupe',
            'nombreDePlaces' => 3,
            'couverts' => 3,
        ]);

        $serveur = Utilisateur::factory()->create([
            'role' => 'serveur',
            'statut' => 'actif',
        ]);

        Commande::factory()->create([
            'idTable' => $table->idTable,
            'idUtilisateur' => $serveur->idUtilisateur,
            'statut' => 'en_preparation',
            'montantTotal' => 120,
        ]);

        $response = $this->getJson('/api/tables/' . $table->idTable);

        $response->assertOk();
        $response->assertJsonPath('couvertsVerrouilles', true);
    }

    public function test_patch_rejects_couverts_update_when_table_has_existing_commande(): void
    {
        $table = TableRestaurant::factory()->create([
            'statut' => 'occupe',
            'nombreDePlaces' => 3,
            'couverts' => 3,
        ]);

        $serveur = Utilisateur::factory()->create([
            'role' => 'serveur',
            'statut' => 'actif',
        ]);

        Commande::factory()->create([
            'idTable' => $table->idTable,
            'idUtilisateur' => $serveur->idUtilisateur,
            'statut' => 'en_preparation',
            'montantTotal' => 80,
        ]);

        $response = $this->patchJson('/api/tables/' . $table->idTable, [
            'couverts' => 2,
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('message', 'Le nombre de couverts est verrouille pour cette table.');
    }
}
