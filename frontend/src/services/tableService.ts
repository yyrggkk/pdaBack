import { TableDetails, TableSummary, TableStatus } from "../types/table";
import { axiosClient } from "../api/axiosClient";

const apiClient = axiosClient;

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
