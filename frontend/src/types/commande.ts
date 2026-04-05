// Types for Commande (Order) and Facture (Invoice) — Espace Serveur & Cuisinier

export type CommandeStatus =
  | 'en_cours'
  | 'valide'
  | 'en_preparation'
  | 'en_cuisine'
  | 'prete'
  | 'servie'
  | 'annule'
  | 'paye'
  | 'facturee';

export interface LigneCommande {
  id: number;
  article_id: number;
  article_nom: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface CommandeItem {
  id: number;
  table_id: number;
  table_numero: number | null;
  couverts: number;
  total: number;
  statut: CommandeStatus;
  date_commande: string;
  lignes: LigneCommande[];
}

export interface CommandesResponse {
  commandes: CommandeItem[];
}

export interface FactureResponse {
  id: number;
  numero_facture: string;
  date_facture: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  mode_paiement: 'especes' | 'carte_bancaire' | 'titre_restaurant';
  commande: {
    id: number;
    table_numero: number | null;
    couverts?: number;
    statut: string;
    date_commande?: string;
    lignes: LigneCommande[];
  };
}

export type ModePaiement = 'especes' | 'carte_bancaire' | 'titre_restaurant';

export const STATUS_LABELS: Record<CommandeStatus, string> = {
  en_cours: 'En cours',
  valide: 'Validée',
  en_preparation: 'En préparation',
  en_cuisine: 'En cuisine',
  prete: 'Prête',
  servie: 'Servie',
  annule: 'Annulée',
  paye: 'Payée',
  facturee: 'Facturée',
};
