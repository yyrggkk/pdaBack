import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

let authToken: string | null = null;

function resolveExpoLanApiUrl(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  const [host] = hostUri.split(":");
  if (!host) {
    return null;
  }

  return `http://${host}:8000/api`;
}

function resolveBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, "");
  }

  const expoLanUrl = resolveExpoLanApiUrl();
  if (expoLanUrl) {
    return expoLanUrl;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api";
  }

  return "http://127.0.0.1:8000/api";
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 12000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}
