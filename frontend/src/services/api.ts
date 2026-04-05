import axios from "axios";
import { MenuResponse } from "../types";

// Configure base URL - update this to your Laravel backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

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
