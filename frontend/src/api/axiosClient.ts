import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// L'URL de ton backend. 
// On tente d'utiliser la variable du fichier .env d'abord.
// Si elle n'est pas trouvée, on utilise l'IP de ta machine.
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.11.105:8000/api';

export const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Intercepteur pour injecter automatiquement le token Sanctum dans nos requêtes futures
axiosClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
