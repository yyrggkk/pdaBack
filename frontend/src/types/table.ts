export type TableStatus = "libre" | "occupee" | "servie" | "indisponible";

export type TableFilter = "toutes" | TableStatus;

export interface TableSummary {
  id: number;
  numero: number;
  statut: TableStatus;
  nombreDePlaces: number;
  couverts: number;
  couvertsVerrouilles: boolean;
}

export interface OrderLine {
  id: number;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  commentaire?: string | null;
  article?: {
    id?: number | null;
    nom?: string | null;
  } | null;
}

export interface CurrentOrder {
  id: number;
  dateCommande: string;
  statut: string;
  montantTotal: number;
  lignes: OrderLine[];
}

export interface TableDetails extends TableSummary {
  commandeEnCours: CurrentOrder | null;
}
