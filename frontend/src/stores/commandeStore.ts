import { create } from 'zustand';
import { CommandeItem, CommandeStatus } from '../types/commande';
import { commandeService } from '../services/api';

interface CommandeState {
  commandes: CommandeItem[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  // Actions
  fetchCommandes: (statut?: string) => Promise<void>;
  updateOrderStatus: (id: number, statut: CommandeStatus) => Promise<void>;
  addOrder: (order: CommandeItem) => void;
  updateOrder: (order: CommandeItem) => void;
  clearError: () => void;
}

export const useCommandeStore = create<CommandeState>((set, get) => ({
  commandes: [],
  loading: false,
  error: null,
  lastFetchedAt: null,

  fetchCommandes: async (statut?: string) => {
    try {
      set({ loading: get().commandes.length === 0, error: null });
      const commandes = await commandeService.getCommandes(statut);
      set({ commandes, loading: false, lastFetchedAt: Date.now() });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erreur lors du chargement des commandes.';
      set({ error: message, loading: false });
    }
  },

  updateOrderStatus: async (id: number, statut: CommandeStatus) => {
    try {
      const updated = await commandeService.updateStatus(id, statut);
      set((state) => ({
        commandes: state.commandes.map((c) =>
          c.id === id ? { ...c, ...updated } : c
        ),
      }));
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erreur lors de la mise à jour du statut.';
      set({ error: message });
      throw error; // re-throw so the caller can handle it
    }
  },

  addOrder: (order: CommandeItem) => {
    set((state) => ({
      commandes: [...state.commandes, order],
    }));
  },

  updateOrder: (order: CommandeItem) => {
    set((state) => ({
      commandes: state.commandes.map((c) =>
        c.id === order.id ? order : c
      ),
    }));
  },

  clearError: () => set({ error: null }),
}));
