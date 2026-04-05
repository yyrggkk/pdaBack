import { View } from "react-native";
import { TABLE_STATUS_COLORS } from "../theme/tableTheme";
import { TableStatus } from "../types/table";

interface StatusRibbonProps {
  statut: TableStatus;
}

export function StatusRibbon({ statut }: StatusRibbonProps) {
  return (
    <View
      style={{ backgroundColor: TABLE_STATUS_COLORS[statut] }}
      className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full"
    />
  );
}
