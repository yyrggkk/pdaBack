import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { axiosClient } from "../api/axiosClient";
import { useAuthStore } from "../store/authStore";
import { fetchAllTables } from "../services/tableService";
import { TABLE_STATUS_COLORS, TABLE_STATUS_LABELS } from "../theme/tableTheme";
import { TableSummary } from "../types/table";
import { TableCard } from "../components/TableCard";

export default function TablesPlanScreen({ navigation }: any) {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuthStore();

  const loadTables = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAllTables();
      setTables(data);
    } catch (e) {
      setError("Impossible de charger les tables. Verifie le backend et l URL API.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTables();
  }, [loadTables]);

  const handleLogout = useCallback(() => {
    Alert.alert("Deconnexion", "Voulez-vous vous deconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se deconnecter",
        style: "destructive",
        onPress: async () => {
          try {
            await axiosClient.post("/logout");
          } catch {
            // Always continue with local logout even if API call fails.
          } finally {
            await logout();
          }
        },
      },
    ]);
  }, [logout]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f9f9ff]" edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color="#006e2f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f2f4fa] px-5 pt-5" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between">
        <Text className="text-5xl font-black tracking-tight text-[#111c2d]">Plan des Tables</Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="h-11 w-11 items-center justify-center rounded-full bg-white"
          accessibilityRole="button"
          accessibilityLabel="Se deconnecter"
        >
          <Ionicons name="log-out-outline" size={22} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-4">
        {(["libre", "occupee", "servie", "indisponible"] as const).map((status) => (
          <View key={status} className="flex-row items-center gap-2">
            <View
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: TABLE_STATUS_COLORS[status], opacity: status === "indisponible" ? 0.25 : 1 }}
            />
            <Text className="text-xs font-semibold text-slate-500">{TABLE_STATUS_LABELS[status]}</Text>
          </View>
        ))}
      </View>

      {error && (
        <View className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3">
          <Text className="text-sm text-red-700">{error}</Text>
          <TouchableOpacity onPress={loadTables} className="mt-2 self-start rounded-full bg-red-600 px-4 py-1.5">
            <Text className="text-xs font-semibold text-white">Reessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tables}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 18 }}
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TableCard
            table={item}
            onPress={(table) => navigation.navigate("TableDetails", { tableId: table.id })}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-slate-500">Aucune table disponible.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
