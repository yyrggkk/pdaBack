import { TableStatus } from "../types/table";

export const TABLE_STATUS_ORDER: TableStatus[] = ["libre", "occupee", "servie"];

export const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
  libre: "#006e2f",
  occupee: "#f59e0b",
  servie: "#da3437",
  indisponible: "#9ca3af",
};

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  libre: "Libre",
  occupee: "Occupee",
  servie: "Servie",
  indisponible: "Indisponible",
};
