import { MenuResponse } from "../types";
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

export default apiClient;
