import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: number;
  nom: string;
  role: 'serveur' | 'cuisinier';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (user, token) => {
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('userData', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
    } catch (e) {
        console.warn("Erreur SecureStore:", e);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userDataStr = await SecureStore.getItemAsync('userData');

      if (token && userDataStr) {
        const user: User = JSON.parse(userDataStr);
        set({ user, token, isAuthenticated: true });
      } else {
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch (e) {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
