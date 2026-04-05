import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchAllTables } from "../services/tableService";
import { TABLE_STATUS_LABELS } from "../theme/tableTheme";
import { TableFilter, TableSummary } from "../types/table";
import { TableCard } from "../components/TableCard";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "TablesPlan">;

const FILTERS: { key: TableFilter; label: string }[] = [
  { key: "toutes", label: "Toutes" },
  { key: "libre", label: "Libres" },
  { key: "occupee", label: "Occupees" },
  { key: "servie", label: "Servies" },
];

export function TablesPlanScreen({ navigation }: Props) {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<TableFilter>("toutes");

  const loadTables = useCallback(async () => {
    try {
      const data = await fetchAllTables();
      setTables(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const filtered = useMemo(() => {
    if (filter === "toutes") {
      return tables;
    }
    return tables.filter((table) => table.statut === filter);
  }, [tables, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTables();
  }, [loadTables]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f9f9ff]">
        <ActivityIndicator size="large" color="#006e2f" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f9f9ff] px-5 pt-5">
      <Text className="text-4xl font-extrabold text-[#111c2d]">Plan des Tables</Text>
      <Text className="mt-1 text-sm text-slate-500">Gestion tactique en temps reel</Text>

      <View className="mt-5 flex-row flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = item.key === filter;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setFilter(item.key)}
              className={`rounded-full px-4 py-2 ${active ? "bg-[#006e2f]" : "bg-white"}`}
            >
              <Text className={`${active ? "text-white" : "text-slate-700"} text-xs font-semibold`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-3 flex-row flex-wrap gap-4">
        {(["libre", "occupee", "servie"] as const).map((status) => (
          <View key={status} className="flex-row items-center gap-2">
            <View
              className="h-2.5 w-2.5 rounded-sm"
              style={{
                backgroundColor:
                  status === "libre" ? "#006e2f" : status === "occupee" ? "#f59e0b" : "#da3437",
              }}
            />
            <Text className="text-xs text-slate-500">{TABLE_STATUS_LABELS[status]}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TableCard
            table={item}
            onPress={(table) => navigation.navigate("TableDetails", { tableId: table.id })}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-slate-500">Aucune table pour ce filtre.</Text>
          </View>
        }
      />
    </View>
  );
}
