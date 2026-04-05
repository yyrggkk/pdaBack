import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useNetworkStore } from '../stores/networkStore';

// L'URL de ton backend.
// On tente d'utiliser la variable du fichier .env d'abord.
// Si elle n'est pas trouvée, on utilise l'IP de ta machine.
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.10:8000/api';

export const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Intercepteur pour injecter automatiquement le token Sanctum dans nos requêtes futures
axiosClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// S-F7: Response interceptor — global error detection for network failures
axiosClient.interceptors.response.use(
  (response) => {
    // Connection restored — mark online
    useNetworkStore.getState().setOffline(false);
    return response;
  },
  async (error) => {
    // Detect network error (no response received)
    if (!error.response) {
      useNetworkStore.getState().setOffline(true);
    }

    // Automatic retry for transient errors (503, 408, network errors)
    const config = error.config;
    if (
      !config.__retryCount &&
      (!error.response || [408, 503, 504].includes(error.response.status))
    ) {
      config.__retryCount = 1;
      // Wait 2 seconds then retry once
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return axiosClient(config);
    }

    return Promise.reject(error);
  }
);
