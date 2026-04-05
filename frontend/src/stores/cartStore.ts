import { create } from "zustand";

export interface CartItem {
  article_id: number;
  nom: string;
  prix: number;
  quantite: number;
  image_url: string;
}

interface CartState {
  items: CartItem[];
  tableId: number | null;
  couverts: number;

  // Actions
  setTableId: (id: number) => void;
  setCouverts: (count: number) => void;
  addItem: (article: Omit<CartItem, "quantite">) => void;
  removeItem: (articleId: number) => void;
  updateQuantity: (articleId: number, quantite: number) => void;
  clearCart: () => void;

  // Computed (as functions)
  getItemCount: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (articleId: number) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  // Initial state
  items: [],
  tableId: null,
  couverts: 1,

  // Actions
  setTableId: (id: number) => {
    set({ tableId: id });
  },

  setCouverts: (count: number) => {
    set({ couverts: Math.max(1, count) });
  },

  addItem: (article: Omit<CartItem, "quantite">) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.article_id === article.article_id
      );

      if (existingIndex !== -1) {
        // Item exists, increment quantity
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantite: updatedItems[existingIndex].quantite + 1,
        };
        return { items: updatedItems };
      } else {
        // New item, add with quantity 1
        return {
          items: [...state.items, { ...article, quantite: 1 }],
        };
      }
    });
  },

  removeItem: (articleId: number) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.article_id === articleId
      );

      if (existingIndex === -1) {
        return state;
      }

      const existingItem = state.items[existingIndex];

      if (existingItem.quantite <= 1) {
        // Remove item from array
        return {
          items: state.items.filter((item) => item.article_id !== articleId),
        };
      } else {
        // Decrement quantity
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantite: updatedItems[existingIndex].quantite - 1,
        };
        return { items: updatedItems };
      }
    });
  },

  updateQuantity: (articleId: number, quantite: number) => {
    set((state) => {
      if (quantite <= 0) {
        // Remove item if quantity is 0 or negative
        return {
          items: state.items.filter((item) => item.article_id !== articleId),
        };
      }

      const existingIndex = state.items.findIndex(
        (item) => item.article_id === articleId
      );

      if (existingIndex === -1) {
        return state;
      }

      const updatedItems = [...state.items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantite,
      };
      return { items: updatedItems };
    });
  },

  clearCart: () => {
    set({ items: [] });
    // Note: tableId and couverts are preserved
  },

  // Computed getters
  getItemCount: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantite, 0);
  },

  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.prix * item.quantite, 0);
  },

  getItemQuantity: (articleId: number) => {
    const { items } = get();
    const item = items.find((item) => item.article_id === articleId);
    return item?.quantite ?? 0;
  },
}));
