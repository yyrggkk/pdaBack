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
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

type TicketStatus = "urgent" | "in-progress";

type TicketItem = {
  id: string;
  label: string;
  checked: boolean;
};

type KitchenTicket = {
  id: string;
  status: TicketStatus;
  statusLabel: "URGENT" | "EN COURS";
  tableLabel: string;
  timer: string;
  items: TicketItem[];
};

const INITIAL_TICKETS: KitchenTicket[] = [
  {
    id: "t15",
    status: "urgent",
    statusLabel: "URGENT",
    tableLabel: "Table 15",
    timer: "18:42",
    items: [
      { id: "t15-i1", label: "2x Burger Signature", checked: false },
      { id: "t15-i2", label: "1x Frites Maison Large", checked: false },
    ],
  },
  {
    id: "t04",
    status: "in-progress",
    statusLabel: "EN COURS",
    tableLabel: "Table 04",
    timer: "08:15",
    items: [
      { id: "t04-i1", label: "1x Salade Cesar", checked: false },
      { id: "t04-i2", label: "1x Risotto Champignons", checked: true },
    ],
  },
  {
    id: "t22",
    status: "in-progress",
    statusLabel: "EN COURS",
    tableLabel: "Table 22",
    timer: "04:30",
    items: [{ id: "t22-i1", label: "3x Tacos Carnitas", checked: false }],
  },
];

export default function CuisinierScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [tickets, setTickets] = useState<KitchenTicket[]>(INITIAL_TICKETS);

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

  const waitingCount = useMemo(() => tickets.length, [tickets]);

  const toggleItem = (ticketId: string, itemId: string) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        return {
          ...ticket,
          items: ticket.items.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)),
        };
      }),
    );
  };

  if (!jakartaLoaded || !workSansLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingHorizontal: Math.round(18 * uiScale) }]}>
        <View style={styles.headerLeftIcon}>
          <MaterialCommunityIcons name="fire" size={Math.round(24 * uiScale)} color="#0d1b36" />
        </View>

        <View style={styles.waitingPill}>
          <View style={styles.waitingDot} />
          <Text style={[styles.waitingText, { fontSize: Math.round(16 * uiScale) }]}>{`${waitingCount} EN ATTENTE`}</Text>
        </View>

        <Text style={[styles.timeText, { fontSize: Math.round(44 * uiScale) }]}>13:24</Text>

        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.scaleDown]}
        >
          <MaterialCommunityIcons name="logout" size={Math.round(18 * uiScale)} color="#0f1f39" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.round(36 * verticalScale),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={[styles.ribbon, ticket.status === "urgent" ? styles.ribbonUrgent : styles.ribbonProgress]} />

            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <View>
                  <Text
                    style={[
                      styles.badgeText,
                      ticket.status === "urgent" ? styles.badgeUrgent : styles.badgeProgress,
                      { fontSize: Math.round(15 * uiScale) },
                    ]}
                  >
                    {ticket.statusLabel}
                  </Text>
                  <Text style={[styles.tableText, { fontSize: Math.round(66 * uiScale) }]}>{ticket.tableLabel}</Text>
                </View>

                <View style={[styles.timerPill, ticket.status === "urgent" ? styles.timerUrgent : styles.timerProgress]}>
                  <MaterialCommunityIcons
                    name="timer"
                    size={Math.round(22 * uiScale)}
                    color={ticket.status === "urgent" ? "#b62027" : "#b35b08"}
                  />
                  <Text
                    style={[
                      styles.timerText,
                      ticket.status === "urgent" ? styles.timerUrgentText : styles.timerProgressText,
                      { fontSize: Math.round(20 * uiScale) },
                    ]}
                  >
                    {ticket.timer}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsWrap}>
                {ticket.items.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleItem(ticket.id, item.id)}
                    style={({ pressed }) => [styles.itemRow, pressed && styles.scaleDown]}
                  >
                    <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                      {item.checked ? <MaterialCommunityIcons name="check" size={20} color="#ffffff" /> : null}
                    </View>

                    <Text
                      style={[
                        styles.itemLabel,
                        { fontSize: Math.round(18 * uiScale) },
                        item.checked && styles.itemLabelChecked,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={({ pressed }) => [styles.readyWrap, pressed && styles.scaleDown]}>
                <LinearGradient
                  colors={["#006e2f", "#22c55e"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.readyButton}
                >
                  <MaterialCommunityIcons name="room-service-outline" size={Math.round(24 * uiScale)} color="#ffffff" />
                  <Text style={[styles.readyText, { fontSize: Math.round(18 * uiScale) }]}>PRET</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  header: {
    height: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7f8fb",
    borderBottomWidth: 1,
    borderBottomColor: "#e6eaf3",
  },
  headerLeftIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#e9edf8",
    alignItems: "center",
    justifyContent: "center",
  },
  waitingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f7efe0",
  },
  waitingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#f2a500",
  },
  waitingText: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#d18a00",
  },
  timeText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0e1d39",
    letterSpacing: -0.9,
  },
  logoutButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e8ecf7",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  ticketCard: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e8ecf5",
    overflow: "hidden",
    flexDirection: "row",
  },
  ribbon: {
    width: 5,
  },
  ribbonUrgent: {
    backgroundColor: "#c90e1d",
  },
  ribbonProgress: {
    backgroundColor: "#ef9b11",
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  badgeText: {
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 1.8,
  },
  badgeUrgent: {
    color: "#c90e1d",
  },
  badgeProgress: {
    color: "#cd7100",
  },
  tableText: {
    marginTop: 6,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#101f3a",
    letterSpacing: -1,
  },
  timerPill: {
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerUrgent: {
    backgroundColor: "#f8e7e8",
  },
  timerProgress: {
    backgroundColor: "#fbf3df",
  },
  timerText: {
    fontFamily: "PlusJakartaSans_700Bold",
  },
  timerUrgentText: {
    color: "#b62027",
  },
  timerProgressText: {
    color: "#b35b08",
  },
  itemsWrap: {
    gap: 10,
    marginBottom: 16,
  },
  itemRow: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: "#edf0fb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#d7def3",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#00773a",
  },
  itemLabel: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#111c2d",
    flexShrink: 1,
  },
  itemLabelChecked: {
    color: "#9aa2ad",
    textDecorationLine: "line-through",
  },
  readyWrap: {
    borderRadius: 30,
    shadowColor: "#10974a",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  readyButton: {
    height: 78,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  readyText: {
    color: "#ffffff",
    fontFamily: "PlusJakartaSans_800ExtraBold",
    letterSpacing: 2,
  },
  scaleDown: {
    transform: [{ scale: 0.98 }],
  },
});
