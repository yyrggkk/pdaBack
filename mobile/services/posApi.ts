import { api, setAuthToken } from "./api";

let currentUserId: number | null = null;

export const LIVE_SYNC_INTERVAL_MS = 2000;

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    nom: string;
    role: "serveur" | "cuisinier";
  };
};

export type ApiTable = {
  id: number;
  numero: number;
  statut: "libre" | "occupee" | "servie" | "indisponible";
  nombreDePlaces: number;
  couverts: number;
  couvertsVerrouilles: boolean;
};

export type ApiMenuCategory = {
  id: number;
  nom: string;
  articles: Array<{
    id: number;
    nom: string;
    prix: number;
    description: string | null;
    disponibilite: boolean;
    image_url: string | null;
  }>;
};

export type ApiCommande = {
  id: number;
  table_id: number;
  table_numero: number | null;
  couverts: number | null;
  total: number;
  statut: string;
  date_commande: string | null;
  lignes: Array<{
    id: number;
    article_id: number;
    article_nom: string;
    quantite: number;
    prix_unitaire: number;
    sous_total: number;
  }>;
};

export type CreateCommandePayload = {
  table_id: number;
  couverts: number;
  utilisateur_id: number;
  lignes: Array<{
    article_id: number;
    quantite: number;
  }>;
};

export async function loginWithPin(pin: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/login", {
    pin: Number(pin),
  });

  setAuthToken(response.data.token);
  currentUserId = response.data.user.id;
  return response.data;
}

export async function logoutCurrentUser(): Promise<void> {
  try {
    await api.post("/logout");
  } finally {
    setAuthToken(null);
    currentUserId = null;
  }
}

export function getCurrentUserId(): number | null {
  return currentUserId;
}

export async function fetchTables(): Promise<ApiTable[]> {
  const response = await api.get<ApiTable[]>("/tables", {
    params: { _ts: Date.now() },
  });
  return response.data;
}

export async function fetchMenuCategories(): Promise<ApiMenuCategory[]> {
  const response = await api.get<{ categories: ApiMenuCategory[] }>("/menu");
  return response.data.categories;
}

export async function fetchCommandes(statuses?: string[]): Promise<ApiCommande[]> {
  const response = await api.get<{ commandes: ApiCommande[] }>("/commandes", {
    params: {
      ...(statuses && statuses.length > 0 ? { statut: statuses.join(",") } : {}),
      _ts: Date.now(),
    },
  });

  return response.data.commandes;
}

export async function createCommande(payload: CreateCommandePayload): Promise<ApiCommande> {
  const response = await api.post<ApiCommande>("/commandes", payload);
  return response.data;
}

export async function updateCommandeStatus(
  commandeId: number,
  statut: "en_preparation" | "prete" | "servie" | "facturee",
): Promise<ApiCommande> {
  const response = await api.patch<ApiCommande>(`/commandes/${commandeId}/status`, {
    statut,
  });

  return response.data;
}
