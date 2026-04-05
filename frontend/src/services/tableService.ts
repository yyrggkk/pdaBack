import axios from "axios";
import { TableDetails, TableSummary, TableStatus } from "../types/table";

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://10.0.2.2:8000/api"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export async function fetchAllTables(): Promise<TableSummary[]> {
  const { data } = await apiClient.get<TableSummary[]>("/tables");
  return data;
}

interface UpdateTablePayload {
  statut?: TableStatus;
  couverts?: number;
}

export async function updateTableStatus(
  tableId: number,
  payload: UpdateTablePayload
): Promise<TableSummary> {
  const { data } = await apiClient.patch<TableSummary>(`/tables/${tableId}`, payload);
  return data;
}

export async function getTableDetails(tableId: number): Promise<TableDetails> {
  const { data } = await apiClient.get<TableDetails>(`/tables/${tableId}`);
  return data;
}
