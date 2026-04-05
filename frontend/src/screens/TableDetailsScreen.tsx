import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getTableDetails, updateTableStatus } from "../services/tableService";
import { TABLE_STATUS_LABELS } from "../theme/tableTheme";
import { TableDetails, TableStatus } from "../types/table";

function nextStatus(current: TableStatus): TableStatus {
  if (current === "libre") return "occupee";
  if (current === "occupee") return "servie";
  if (current === "servie") return "libre";
  return "libre";
}

export default function TableDetailsScreen({ navigation, route }: any) {
  const { tableId } = route.params;
  const insets = useSafeAreaInsets();
  const [table, setTable] = useState<TableDetails | null>(null);
  const [couverts, setCouverts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      const data = await getTableDetails(tableId);
      setTable(data);
      setCouverts(data.couverts);
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const updateCouverts = async (nextValue: number) => {
    if (!table || nextValue < 0 || nextValue > table.nombreDePlaces) return;

    setSaving(true);
    try {
      const updated = await updateTableStatus(table.id, {
        couverts: nextValue,
      });
      setTable((prev) => (prev ? { ...prev, ...updated } : prev));
      setCouverts(updated.couverts);
    } finally {
      setSaving(false);
    }
  };

  const advanceStatus = async () => {
    if (!table || table.statut === "indisponible") return;

    const target = nextStatus(table.statut);
    setSaving(true);
    try {
      const updated = await updateTableStatus(table.id, {
        statut: target,
        couverts: target === "libre" ? 0 : Math.max(couverts, 1),
      });
      setTable((prev) => (prev ? { ...prev, ...updated } : prev));
      setCouverts(updated.couverts);
    } finally {
      setSaving(false);
      loadDetails();
    }
  };

  if (loading || !table) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f9f9ff]" edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color="#006e2f" />
      </SafeAreaView>
    );
  }

  const statusColor =
    table.statut === "libre" ? "#006e2f" : table.statut === "occupee" ? "#f59e0b" : "#da3437";
  const canRequestInvoice = Boolean(
    table.commandeEnCours && String(table.commandeEnCours.statut).toLowerCase() === "servie"
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f9f9ff]" edges={["top", "bottom"]}>
      <View className="flex-row items-center border-b border-slate-200 px-5 pb-4 pt-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{ marginTop: -2 }}
        >
          <Ionicons name="chevron-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-extrabold text-[#111c2d]">
          Table {String(table.numero).padStart(2, "0")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 200 + insets.bottom }}>
        <View className="mb-5 flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
          <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: statusColor }}>
            {TABLE_STATUS_LABELS[table.statut]}
          </Text>
        </View>

        <View className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5">
          <View className="absolute bottom-4 left-0 top-4 w-1.5 rounded-r-full" style={{ backgroundColor: statusColor }} />
          <View className="ml-3">
            <Text className="text-xl font-extrabold text-slate-900">Couverts</Text>
            <Text className="mt-1 text-xs text-slate-500">Nombre de convives a table</Text>

            <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-[#f0f3ff] p-2">
              <TouchableOpacity
                disabled={saving || couverts <= 0}
                onPress={() => updateCouverts(couverts - 1)}
                className="h-14 w-14 items-center justify-center rounded-xl bg-white"
              >
                <Text className="text-2xl font-bold text-slate-700">-</Text>
              </TouchableOpacity>

              <Text className="text-4xl font-extrabold text-slate-900">{couverts}</Text>

              <TouchableOpacity
                disabled={saving || couverts >= table.nombreDePlaces}
                onPress={() => updateCouverts(couverts + 1)}
                className="h-14 w-14 items-center justify-center rounded-xl bg-white"
              >
                <Text className="text-2xl font-bold text-slate-700">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-[#e5e8f4] bg-[#f0f3ff] p-4">
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Capacite maximale
          </Text>
          <Text className="mt-1 text-base font-bold text-slate-900">
            Jusqu a {table.nombreDePlaces} personnes
          </Text>
        </View>

        {table.commandeEnCours && (
          <View className="mt-6">
            <Text className="mb-2 text-base font-bold text-slate-900">Commande en cours</Text>
            <View className="rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="text-sm font-semibold text-slate-900">
                Commande #{table.commandeEnCours.id}
              </Text>
              <Text className="mt-1 text-xs text-slate-500">
                {table.commandeEnCours.lignes.length} articles - statut {table.commandeEnCours.statut}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 rounded-t-[32px] border-t border-slate-200 bg-white px-5 pt-4"
        style={{ paddingBottom: 12 + insets.bottom }}
      >
        {canRequestInvoice && (
          <TouchableOpacity
            disabled={saving || table.statut === "indisponible"}
            onPress={advanceStatus}
            className="mb-3 h-12 items-center justify-center rounded-full bg-slate-100"
          >
            <Text className="font-semibold text-slate-700">Demander la facture</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("MenuFromTable", { tableId: table.id })}
          className="h-16 items-center justify-center rounded-2xl bg-[#006e2f]"
        >
          <Text className="text-base font-bold text-white">Prendre commande</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
