import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { TABLE_STATUS_LABELS } from "../theme/tableTheme";
import { TableSummary } from "../types/table";
import { StatusRibbon } from "./StatusRibbon";

interface TableCardProps {
  table: TableSummary;
  onPress: (table: TableSummary) => void;
}

function renderChairs(count: number) {
  const chairs = [];
  for (let i = 0; i < count; i += 1) {
    chairs.push(
      <View key={`chair-${i}`} className="h-1.5 w-1.5 rounded-sm bg-black/25" />
    );
  }
  return chairs;
}

export function TableCard({ table, onPress }: TableCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(table)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="w-[47%]"
    >
      <Animated.View
        style={{ transform: [{ scale }] }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4"
      >
        <StatusRibbon statut={table.statut} />

        <View className="ml-2 gap-1">
          <Text className="font-bold text-slate-900">Table {String(table.numero).padStart(2, "0")}</Text>
          <Text className="text-xs text-slate-500">{TABLE_STATUS_LABELS[table.statut]}</Text>
        </View>

        <View className="mt-3 flex-row items-end justify-between">
          <View>
            <Text className="text-[11px] uppercase tracking-widest text-slate-400">Couverts</Text>
            <Text className="text-2xl font-extrabold text-slate-900">{table.couverts}</Text>
          </View>
          <View className="items-end">
            <Text className="text-[11px] uppercase tracking-widest text-slate-400">Capacite</Text>
            <Text className="text-sm font-semibold text-slate-700">{table.nombreDePlaces}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row flex-wrap gap-1">{renderChairs(Math.min(table.nombreDePlaces, 8))}</View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
