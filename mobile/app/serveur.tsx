import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts as useJakartaFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  useFonts as useWorkSansFonts,
} from "@expo-google-fonts/work-sans";
import { useRouter } from "expo-router";
import BottomNavBar from "../components/BottomNavBar";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type TableStatus = "free" | "occupied" | "served" | "disabled";

type ServeurScreenProps = {
  showBottomNav?: boolean;
};

type TableItem = {
  number: string;
  status: TableStatus;
};

const TABLES: TableItem[] = [
  { number: "01", status: "free" },
  { number: "02", status: "free" },
  { number: "03", status: "served" },
  { number: "04", status: "occupied" },
  { number: "05", status: "free" },
  { number: "08", status: "served" },
  { number: "12", status: "free" },
  { number: "14", status: "occupied" },
  { number: "15", status: "occupied" },
  { number: "16", status: "free" },
  { number: "21", status: "occupied" },
  { number: "22", status: "free" },
  { number: "23", status: "disabled" },
  { number: "24", status: "disabled" },
  { number: "25", status: "disabled" },
];

const STATUS_COLOR: Record<TableStatus, string> = {
  free: "#007f35",
  occupied: "#f59e0b",
  served: "#e12f33",
  disabled: "#93bea8",
};

export function ServeurScreen({ showBottomNav = true }: ServeurScreenProps = {}) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [jakartaLoaded] = useJakartaFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [workSansLoaded] = useWorkSansFonts({
    WorkSans_500Medium,
    WorkSans_600SemiBold,
  });

  const rows = useMemo(() => TABLES, []);
  const uiScale = Math.max(0.72, Math.min(width / 430, 1));
  const verticalScale = Math.max(0.82, Math.min(height / 900, 1));
  const tableSize = Math.max(86, Math.min(112, (width - 96) / 3));

  if (!jakartaLoaded || !workSansLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <MaterialCommunityIcons name="silverware-variant" size={28} color="#007f35" />

        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#0f1f39" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 14 * verticalScale,
            paddingBottom: 180 * verticalScale,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: Math.round(49 * uiScale),
              lineHeight: Math.round(54 * uiScale),
              letterSpacing: -1.1 * uiScale,
            },
          ]}
        >
          Plan des Tables
        </Text>
        <Text style={[styles.subtitle, { fontSize: Math.round(19 * uiScale) }]}>Gestion tactique en temps reel</Text>

        <View style={styles.legendRow}>
          <LegendItem label="Libre" color="#007f35" />
          <LegendItem label="Occupe" color="#f59e0b" />
          <LegendItem label="Servie" color="#e12f33" />
          <LegendItem label="Indisponible" color="#93bea8" isMuted />
        </View>

        <View style={styles.grid}>
          {rows.map((table) => (
            <TableCard
              key={table.number}
              table={table}
              tableSize={tableSize}
              onPress={() => {
                if (table.status !== "free" && table.status !== "occupied" && table.status !== "served") {
                  return;
                }

                router.push({
                  pathname: "/table/[tableId]",
                  params: {
                    tableId: table.number,
                    status: table.status,
                    covers: table.status === "occupied" ? "3" : table.status === "served" ? "4" : "2",
                    capacity: "4",
                    openedAt: table.status === "occupied" ? "12:45" : "",
                    lastServedAt: table.status === "served" ? "13:12" : "",
                  },
                });
              }}
            />
          ))}
        </View>
      </ScrollView>
      {showBottomNav ? <BottomNavBar activeTab="plan" /> : null}
    </SafeAreaView>
  );
}

export default function ServeurRoute() {
  return <ServeurScreen />;
}

type LegendItemProps = {
  label: string;
  color: string;
  isMuted?: boolean;
};

function LegendItem({ label, color, isMuted }: LegendItemProps) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: isMuted ? "transparent" : color,
            borderWidth: isMuted ? 2 : 0,
            borderColor: color,
            opacity: isMuted ? 0.45 : 1,
          },
        ]}
      />
      <Text style={[styles.legendText, isMuted && styles.legendTextMuted]}>{label}</Text>
    </View>
  );
}

type TableCardProps = {
  table: TableItem;
  tableSize: number;
  onPress: () => void;
};

function TableCard({ table, tableSize, onPress }: TableCardProps) {
  const borderColor = STATUS_COLOR[table.status];
  const isDisabled = table.status === "disabled";
  const isClickable = table.status === "free" || table.status === "occupied" || table.status === "served";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tableWrap,
        isDisabled && styles.tableWrapDisabled,
        !isClickable && styles.tableWrapBlocked,
        pressed && isClickable && styles.tableWrapPressed,
      ]}
      disabled={!isClickable}
    >
      <View
        style={[
          styles.tableVisual,
          {
            borderColor,
            width: tableSize,
            height: Math.round(tableSize * 0.7),
          },
        ]}
      >
        <Text
          style={[
            styles.tableNumber,
            { fontSize: Math.round(tableSize * 0.36), lineHeight: Math.round(tableSize * 0.42) },
            isDisabled && styles.tableNumberDisabled,
          ]}
        >
          {table.number}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f1f2f8",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#f1f2f8",
  },
  topBar: {
    height: 56,
    backgroundColor: "rgba(249, 249, 255, 0.72)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 26,
  },
  logoutButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e8ecf7",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 14,
    paddingBottom: 180,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0e1c37",
    fontSize: 49,
    lineHeight: 54,
    letterSpacing: -1.1,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: "WorkSans_500Medium",
    color: "#6e756f",
    fontSize: 19,
    lineHeight: 26,
  },
  legendRow: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 18,
    rowGap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: "WorkSans_500Medium",
    color: "#2f3839",
    fontSize: 14,
  },
  legendTextMuted: {
    opacity: 0.58,
  },
  grid: {
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 36,
  },
  tableWrap: {
    width: "30.8%",
    alignItems: "center",
    justifyContent: "center",
  },
  tableWrapDisabled: {
    opacity: 0.72,
  },
  tableWrapBlocked: {
    opacity: 0.88,
  },
  tableWrapPressed: {
    transform: [{ scale: 0.96 }],
  },
  tableVisual: {
    width: 110,
    height: 78,
    borderRadius: 14,
    borderWidth: 3,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111c2d",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  tableNumber: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0f1f3a",
    fontSize: 36,
    lineHeight: 42,
  },
  tableNumberDisabled: {
    color: "#99a1ae",
  },
});
