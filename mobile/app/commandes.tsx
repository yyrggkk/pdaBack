import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts as useJakartaFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
  useFonts as useWorkSansFonts,
} from "@expo-google-fonts/work-sans";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import BottomNavBar from "../components/BottomNavBar";
import { fetchCommandes, updateCommandeStatus } from "../services/posApi";

type OrderStatus = "ready" | "kitchen" | "served";
type FilterKey = "all" | "ready" | "kitchen" | "served";

type CommandesScreenProps = {
  showBottomNav?: boolean;
};

type OrderItem = {
  id: string;
  tableNumber: string;
  commandNumber: string;
  articleText: string;
  timingText: string;
  status: OrderStatus;
};

const STATUS_STYLES = {
  ready: {
    ribbon: "#007f35",
    badgeBg: "#e6f4ea",
    badgeText: "#007f35",
    badgeIcon: "bell-outline" as const,
    badgeLabel: "A SERVIR",
    timingBg: "#e6f4ea",
    timingText: "#007f35",
    timingIcon: "clock-outline" as const,
  },
  kitchen: {
    ribbon: "#f59e0b",
    badgeBg: "#e6e9f4",
    badgeText: "#f59e0b",
    badgeIcon: "fire" as const,
    badgeLabel: "EN CUISINE",
    timingBg: "#e6e9f4",
    timingText: "#f59e0b",
    timingIcon: "timer-outline" as const,
  },
  served: {
    ribbon: "#e98287",
    badgeBg: "transparent",
    badgeText: "#e98287",
    badgeIcon: "check-all" as const,
    badgeLabel: "SERVIE",
    timingBg: "#e6e9f4",
    timingText: "#e98287",
    timingIcon: "clock-outline" as const,
  },
};

const STATUS_PRIORITY: Record<OrderStatus, number> = {
  ready: 0,
  kitchen: 1,
  served: 2,
};

export function CommandesScreen({ showBottomNav = true }: CommandesScreenProps = {}) {
  const { width, height } = useWindowDimensions();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [servingOrderId, setServingOrderId] = useState<string | null>(null);

  const [jakartaLoaded] = useJakartaFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [workSansLoaded] = useWorkSansFonts({
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  const uiScale = Math.max(0.72, Math.min(width / 430, 1));
  const verticalScale = Math.max(0.82, Math.min(height / 900, 1));

  const loadCommandes = async () => {
    try {
      const commandes = await fetchCommandes();

      const mapped: OrderItem[] = commandes.map((commande) => {
        let status: OrderStatus = "kitchen";

        if (commande.statut === "prete") {
          status = "ready";
        } else if (commande.statut === "servie" || commande.statut === "facturee") {
          status = "served";
        }

        const articleCount = commande.lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);

        return {
          id: String(commande.id),
          tableNumber: String(commande.table_numero ?? "00").padStart(2, "0"),
          commandNumber: `Cmd #${commande.id}`,
          articleText: status === "served" ? "Service termine" : `${articleCount} articles`,
          timingText: status === "served" ? "Commande servie" : "En cours",
          status,
        };
      });

      setOrders(mapped);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadCommandes();
  }, []);

  const markOrderServed = async (orderId: string) => {
    if (servingOrderId || !orderId) {
      return;
    }

    setServingOrderId(orderId);

    try {
      const numericId = Number(orderId);
      if (Number.isNaN(numericId)) {
        return;
      }

      await updateCommandeStatus(numericId, "servie");
      await loadCommandes();
    } finally {
      setServingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const statusSorted = [...orders].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

    if (filter === "all") return statusSorted;
    return statusSorted.filter((item) => item.status === filter);
  }, [filter, orders]);

  const readyCount = orders.filter((item) => item.status === "ready").length;
  const kitchenCount = orders.filter((item) => item.status === "kitchen").length;
  const servedCount = orders.filter((item) => item.status === "served").length;

  if (!jakartaLoaded || !workSansLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.headerWrap}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={Math.round(48 * uiScale)} color="#00773a" />
          <Text style={[styles.title, { fontSize: Math.round(32 * uiScale) }]}>Commandes</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          style={styles.filtersWrap}
        >
          <FilterChip
            label={`Toutes (${orders.length})`}
            active={filter === "all"}
            activeBg="#0d1d39"
            activeText="#ffffff"
            onPress={() => setFilter("all")}
          />
          <FilterChip
            label={`Prets (${readyCount})`}
            active={filter === "ready"}
            activeBg="#e6e9f4"
            activeText="#007f35"
            dotColor="#007f35"
            onPress={() => setFilter("ready")}
          />
          <FilterChip
            label={`En Cuisine (${kitchenCount})`}
            active={filter === "kitchen"}
            activeBg="#e6e9f4"
            activeText="#f59e0b"
            dotColor="#f59e0b"
            onPress={() => setFilter("kitchen")}
          />
          <FilterChip
            label={`Servies (${servedCount})`}
            active={filter === "served"}
            activeBg="#e6e9f4"
            activeText="#e98287"
            dotColor="#e98287"
            onPress={() => setFilter("served")}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.round(16 * verticalScale),
            paddingBottom: Math.round(130 * verticalScale),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsWrap}>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              uiScale={uiScale}
              isServing={servingOrderId === order.id}
              onMarkServed={markOrderServed}
            />
          ))}
        </View>
      </ScrollView>

      {showBottomNav ? <BottomNavBar activeTab="commandes" /> : null}
    </SafeAreaView>
  );
}

export default function CommandesRoute() {
  return <CommandesScreen />;
}

type FilterChipProps = {
  label: string;
  active: boolean;
  activeBg: string;
  activeText: string;
  dotColor?: string;
  onPress: () => void;
};

function FilterChip({ label, active, activeBg, activeText, dotColor, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: active ? activeBg : "#e6e9f4",
        },
        pressed && styles.scaleDown,
      ]}
    >
      {dotColor ? <View style={[styles.filterDot, { backgroundColor: dotColor }]} /> : null}
      <Text style={[styles.filterText, { color: active ? activeText : "#6f7683" }]}>{label}</Text>
    </Pressable>
  );
}

type OrderCardProps = {
  order: OrderItem;
  uiScale: number;
  isServing: boolean;
  onMarkServed: (orderId: string) => void;
};

function OrderCard({ order, uiScale, isServing, onMarkServed }: OrderCardProps) {
  const statusStyle = STATUS_STYLES[order.status];
  const isServed = order.status === "served";

  return (
    <View style={[styles.card, isServed && styles.cardServed]}>
      <View style={[styles.statusRibbon, { backgroundColor: statusStyle.ribbon }]} />

      <View style={styles.cardTop}>
        <View>
          <Text style={styles.tableLabel}>TABLE</Text>
          <Text style={[styles.tableNumber, isServed && styles.tableNumberServed]}>{order.tableNumber}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusStyle.badgeBg,
            },
          ]}
        >
          <MaterialCommunityIcons name={statusStyle.badgeIcon} size={Math.round(19 * uiScale)} color={statusStyle.badgeText} />
          <Text style={[styles.statusBadgeText, { color: statusStyle.badgeText }]}>{statusStyle.badgeLabel}</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.cardBottom}>
        <View style={styles.metaBlock}>
          <Text style={[styles.commandText, isServed && styles.commandTextServed]}>{order.commandNumber}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="archive-outline" size={16} color="#4c5749" />
              <Text style={styles.metaPillText}>{order.articleText}</Text>
            </View>

            <View style={[styles.metaPill, { backgroundColor: statusStyle.timingBg }]}>
              <MaterialCommunityIcons name={statusStyle.timingIcon} size={16} color={statusStyle.timingText} />
              <Text style={[styles.metaPillText, { color: statusStyle.timingText }]}>{order.timingText}</Text>
            </View>
          </View>
        </View>

        {order.status === "ready" ? (
          <Pressable
            disabled={isServing}
            onPress={() => onMarkServed(order.id)}
            style={({ pressed }) => [
              styles.validateButtonWrap,
              isServing && styles.validateButtonWrapDisabled,
              pressed && !isServing && styles.scaleDown,
            ]}
          >
            <LinearGradient
              colors={isServing ? ["#9aa3b1", "#c0c7d2"] : ["#00883d", "#1fc85f"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.validateButton}
            >
              <MaterialCommunityIcons name="check" size={34} color="#ffffff" />
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f3f8",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#f2f3f8",
  },
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0e1c38",
    letterSpacing: -1.1,
  },
  filtersWrap: {
    marginTop: 18,
  },
  filtersContent: {
    gap: 12,
    paddingRight: 8,
  },
  filterChip: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  filterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  filterText: {
    fontFamily: "WorkSans_700Bold",
    fontSize: 18,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  cardsWrap: {
    gap: 18,
  },
  card: {
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: 42,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#dce8df",
    overflow: "hidden",
  },
  cardServed: {
    opacity: 0.62,
  },
  statusRibbon: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
  },
  cardTop: {
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tableLabel: {
    fontFamily: "WorkSans_700Bold",
    color: "#3d473e",
    fontSize: 18,
    letterSpacing: 2.1,
  },
  tableNumber: {
    marginTop: 2,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0d1b36",
    fontSize: 72,
    lineHeight: 78,
  },
  tableNumberServed: {
    color: "#687280",
  },
  statusBadge: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  statusBadgeText: {
    fontFamily: "WorkSans_700Bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e8ef",
    marginTop: 14,
    marginBottom: 12,
    marginHorizontal: 12,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingLeft: 14,
    paddingRight: 6,
  },
  metaBlock: {
    flex: 1,
    paddingRight: 12,
  },
  commandText: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0d1b36",
    fontSize: 44,
    lineHeight: 50,
  },
  commandTextServed: {
    color: "#687280",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: "#e6e9f4",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  metaPillText: {
    fontFamily: "WorkSans_700Bold",
    color: "#445143",
    fontSize: 15,
  },
  validateButtonWrap: {
    borderRadius: 46,
    shadowColor: "#1fa653",
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  validateButtonWrapDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  validateButton: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  scaleDown: {
    transform: [{ scale: 0.96 }],
  },
});
