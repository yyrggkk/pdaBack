import { MenuResponse } from "../types";
import { CommandesResponse, CommandeItem, FactureResponse, ModePaiement } from "../types/commande";
import { axiosClient } from "../api/axiosClient";

const apiClient = axiosClient;

export const menuService = {
  /**
   * Fetch all menu categories with their articles
   */
  getMenu: async (): Promise<MenuResponse> => {
    const response = await apiClient.get<MenuResponse>("/menu");
    return response.data;
  },
};

// Order types
export interface OrderLinePayload {
  article_id: number;
  quantite: number;
}

export interface CreateOrderPayload {
  table_id: number;
  couverts: number;
  utilisateur_id: number;
  lignes: OrderLinePayload[];
}

export interface OrderLineResponse {
  id: number;
  article_id: number;
  article_nom: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface CreateOrderResponse {
  id: number;
  table_id: number;
  couverts: number;
  total: number;
  statut: string;
  lignes: OrderLineResponse[];
  created_at: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export const orderService = {
  /**
   * Create a new order
   */
  createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    const response = await apiClient.post<CreateOrderResponse>("/commandes", payload);
    return response.data;
  },
};

/**
 * S-B1 / S-F3: Commande (order) service
 */
export const commandeService = {
  /**
   * GET /api/commandes — list orders, optionally filtered by status
   */
  getCommandes: async (statut?: string): Promise<CommandeItem[]> => {
    const params: Record<string, string> = {};
    if (statut) params.statut = statut;
    const response = await apiClient.get<CommandesResponse>("/commandes", { params });
    return response.data.commandes;
  },

  /**
   * PATCH /api/commandes/{id}/status — update order status
   */
  updateStatus: async (id: number, statut: string): Promise<CommandeItem> => {
    const response = await apiClient.patch<CommandeItem>(`/commandes/${id}/status`, { statut });
    return response.data;
  },
};

/**
 * S-B3 / S-B5 / S-F4: Facture (invoice) service
 */
export const factureService = {
  /**
   * POST /api/factures — generate invoice from order
   */
  create: async (commandeId: number, modePaiement: ModePaiement): Promise<FactureResponse> => {
    const response = await apiClient.post<FactureResponse>("/factures", {
      commande_id: commandeId,
      mode_paiement: modePaiement,
    });
    return response.data;
  },

  /**
   * GET /api/factures/{id} — retrieve invoice details
   */
  getById: async (id: number): Promise<FactureResponse> => {
    const response = await apiClient.get<FactureResponse>(`/factures/${id}`);
    return response.data;
  },
};

export default apiClient;
