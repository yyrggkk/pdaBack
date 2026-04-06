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
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

type TableStatus = "free" | "occupied" | "served";

type OccupiedOrder = {
  id: string;
  title: string;
  details: string;
  badge: "PRET" | "EN CUISINE";
};

type ServedOrder = {
  id: string;
  title: string;
  details: string;
};

const OCCUPIED_ORDERS: OccupiedOrder[] = [
  { id: "2134", title: "Commande 2134", details: "3 articles • 12:50", badge: "PRET" },
  { id: "2136", title: "Commande 2136", details: "1 article • 13:05", badge: "EN CUISINE" },
];

const SERVED_CURRENT_ORDERS: OccupiedOrder[] = [
  { id: "2140", title: "Commande 2140", details: "2 articles • 13:15", badge: "EN CUISINE" },
];

const SERVED_DONE_ORDERS: ServedOrder[] = [
  { id: "2134", title: "Commande 2134", details: "3 articles • 12:50" },
  { id: "2136", title: "Commande 2136", details: "1 article • 13:05" },
];

export default function TableDetailScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{
    tableId?: string;
    covers?: string;
    capacity?: string;
    status?: string;
    openedAt?: string;
    lastServedAt?: string;
  }>();

  const [jakartaLoaded] = useJakartaFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [workSansLoaded] = useWorkSansFonts({
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  const tableId = params.tableId ?? "12";
  const status = (params.status as TableStatus | undefined) ?? "free";
  const capacity = Number(params.capacity ?? 4);
  const initialCovers = Number(params.covers ?? 2);
  const openedAt = params.openedAt ?? "12:45";
  const lastServedAt = params.lastServedAt ?? "13:12";
  const [covers, setCovers] = useState(Math.max(1, Math.min(initialCovers, capacity)));

  const uiScale = Math.max(0.72, Math.min(width / 430, 1));
  const verticalScale = Math.max(0.82, Math.min(height / 900, 1));

  const canDecrease = covers > 1;
  const canIncrease = covers < capacity;

  const title = useMemo(() => `Table ${tableId}`, [tableId]);
  const isOccupied = status === "occupied";
  const isServed = status === "served";
  const isBusy = isOccupied || isServed;
  const busyCurrentOrders = isServed ? SERVED_CURRENT_ORDERS : OCCUPIED_ORDERS;

  const goToTableMenu = () => {
    router.push({
      pathname: "/table/[tableId]/menu",
      params: {
        tableId,
      },
    });
  };

  const goToFacture = () => {
    router.push({
      pathname: "/table/[tableId]/facture",
      params: {
        tableId,
      },
    });
  };

  if (!jakartaLoaded || !workSansLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: Math.round(10 * verticalScale) }]}> 
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.scaleDown]}
        >
          <MaterialCommunityIcons name="chevron-left" size={Math.round(36 * uiScale)} color="#0d1b36" />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(48 * uiScale) }]}>{title}</Text>
      </View>

      {isBusy ? (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.round(18 * verticalScale),
              paddingBottom: Math.round(150 * verticalScale),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.occupiedTopRow}>
            <View style={styles.statusRow}>
              <View
                style={[styles.statusDot, isServed ? styles.statusDotServed : styles.statusDotOccupied]}
              />
              <Text
                style={[
                  styles.statusText,
                  isServed ? styles.statusTextServed : styles.statusTextOccupied,
                  { fontSize: Math.round(20 * uiScale) },
                ]}
              >
                {isServed ? "SERVIE" : "OCCUPEE"}
              </Text>
            </View>

            <View style={styles.guestPill}>
              <MaterialCommunityIcons name="account-group-outline" size={Math.round(24 * uiScale)} color="#465341" />
              <Text style={[styles.guestPillText, { fontSize: Math.round(17 * uiScale) }]}>{`${covers} Personnes`}</Text>
            </View>
          </View>

          <Text style={[styles.openedText, { fontSize: Math.round(22 * uiScale) }]}>
            {isServed ? `Dernier plat servi a ${lastServedAt}` : `Ouverte a ${openedAt}`}
          </Text>

          <View style={styles.occupiedSectionHeader}>
            <Text style={[styles.occupiedSectionTitle, { fontSize: Math.round(24 * uiScale) }]}>
              {isServed ? "Commande en cours" : "Commandes en cours"}
            </Text>
            <View style={[styles.occupiedCountPill, isServed && styles.servedCountPill]}>
              <Text style={[styles.occupiedCountText, isServed && styles.servedCountText, { fontSize: Math.round(15 * uiScale) }]}>
                {isServed ? `${busyCurrentOrders.length} attente` : `${busyCurrentOrders.length} articles`}
              </Text>
            </View>
          </View>

          <View style={styles.occupiedOrdersWrap}>
            {busyCurrentOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderRibbon} />
                <View style={styles.orderTextWrap}>
                  <Text style={[styles.orderTitle, { fontSize: Math.round(21 * uiScale) }]}>{order.title}</Text>
                  <Text style={[styles.orderDetails, { fontSize: Math.round(16 * uiScale) }]}>{order.details}</Text>
                </View>

                <View style={styles.orderActionWrap}>
                  <View style={[styles.orderBadge, order.badge === "PRET" ? styles.orderBadgeReady : styles.orderBadgeKitchen]}>
                    <Text style={[styles.orderBadgeText, { fontSize: Math.round(14 * uiScale) }]}>{order.badge}</Text>
                  </View>
                  <Pressable
                    disabled={order.badge === "EN CUISINE"}
                    style={({ pressed }) => [
                      styles.orderCheckButton,
                      order.badge === "EN CUISINE" && styles.orderCheckButtonDisabled,
                      pressed && order.badge !== "EN CUISINE" && styles.scaleDown,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="check"
                      size={Math.round(34 * uiScale)}
                      color={order.badge === "EN CUISINE" ? "#b1b8c4" : "#ffffff"}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          {isServed ? (
            <>
              <Text style={[styles.servedSectionTitle, { fontSize: Math.round(22 * uiScale) }]}>Deja servis</Text>

              <View style={styles.occupiedOrdersWrap}>
                {SERVED_DONE_ORDERS.map((order) => (
                  <View key={order.id} style={[styles.orderCard, styles.orderCardServed]}>
                    <View style={[styles.orderRibbon, styles.orderRibbonServed]} />
                    <View style={styles.orderTextWrap}>
                      <Text style={[styles.orderTitle, styles.orderTitleServed, { fontSize: Math.round(21 * uiScale) }]}>
                        {order.title}
                      </Text>
                      <Text style={[styles.orderDetails, { fontSize: Math.round(16 * uiScale) }]}>{order.details}</Text>
                    </View>

                    <View style={styles.servedStampWrap}>
                      <MaterialCommunityIcons name="check-circle" size={Math.round(24 * uiScale)} color="#df5f66" />
                      <Text style={[styles.servedStampText, { fontSize: Math.round(14 * uiScale) }]}>SERVI</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={[styles.statusText, { fontSize: Math.round(20 * uiScale) }]}>LIBRE</Text>
          </View>

          <View style={[styles.coversCard, { borderRadius: Math.round(36 * uiScale) }]}> 
            <View style={styles.coversRibbon} />

            <Text style={[styles.coversTitle, { fontSize: Math.round(58 * uiScale) }]}>Couverts</Text>
            <Text style={[styles.coversSubtitle, { fontSize: Math.round(18 * uiScale) }]}>Nombre de convives a table</Text>

            <View style={[styles.counterWrap, { borderRadius: Math.round(26 * uiScale) }]}> 
              <Pressable
                onPress={() => canDecrease && setCovers((value) => value - 1)}
                style={({ pressed }) => [
                  styles.counterButton,
                  !canDecrease && styles.counterButtonDisabled,
                  pressed && canDecrease && styles.scaleDown,
                ]}
              >
                <MaterialCommunityIcons name="minus" size={Math.round(42 * uiScale)} color="#0d1b36" />
              </Pressable>

              <Text style={[styles.counterValue, { fontSize: Math.round(66 * uiScale) }]}>{covers}</Text>

              <Pressable
                onPress={() => canIncrease && setCovers((value) => value + 1)}
                style={({ pressed }) => [
                  styles.counterButton,
                  !canIncrease && styles.counterButtonDisabled,
                  pressed && canIncrease && styles.scaleDown,
                ]}
              >
                <MaterialCommunityIcons name="plus" size={Math.round(42 * uiScale)} color="#0d1b36" />
              </Pressable>
            </View>
          </View>

          <View style={[styles.capacityCard, { borderRadius: Math.round(24 * uiScale) }]}> 
            <View style={styles.capacityIconWrap}>
              <MaterialCommunityIcons name="information-outline" size={Math.round(28 * uiScale)} color="#00773a" />
            </View>
            <View style={styles.capacityTextWrap}>
              <Text style={[styles.capacityLabel, { fontSize: Math.round(13 * uiScale) }]}>CAPACITE MAXIMALE</Text>
              <Text style={[styles.capacityValue, { fontSize: Math.round(22 * uiScale) }]}>{`Jusqu'a ${capacity} personnes`}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.bottomDock}>
        {isOccupied ? (
          <>
            <View style={styles.dockHandle} />
            <View style={styles.secondaryActionDisabled}>
              <MaterialCommunityIcons name="receipt-text-outline" size={Math.round(26 * uiScale)} color="#a4aab4" />
              <Text style={[styles.secondaryActionDisabledText, { fontSize: Math.round(18 * uiScale) }]}>Demander la facture</Text>
            </View>

            <Pressable onPress={goToTableMenu} style={({ pressed }) => [styles.ctaWrap, pressed && styles.scaleDown]}>
              <LinearGradient
                colors={["#00883d", "#23c75f"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cta}
              >
                <MaterialCommunityIcons name="cart-plus" size={Math.round(38 * uiScale)} color="#ffffff" />
                <Text style={[styles.ctaText, { fontSize: Math.round(21 * uiScale) }]}>Nouvelle Commande</Text>
              </LinearGradient>
            </Pressable>
          </>
        ) : isServed ? (
          <>
            <View style={styles.dockHandle} />
            <Pressable onPress={goToFacture} style={({ pressed }) => [styles.secondaryActionEnabled, pressed && styles.scaleDown]}>
              <MaterialCommunityIcons name="receipt-text-outline" size={Math.round(26 * uiScale)} color="#0d1b36" />
              <Text style={[styles.secondaryActionEnabledText, { fontSize: Math.round(18 * uiScale) }]}>Demander la facture</Text>
            </Pressable>

            <Pressable onPress={goToTableMenu} style={({ pressed }) => [styles.ctaWrap, pressed && styles.scaleDown]}>
              <LinearGradient
                colors={["#00883d", "#23c75f"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cta}
              >
                <MaterialCommunityIcons name="cart-plus" size={Math.round(38 * uiScale)} color="#ffffff" />
                <Text style={[styles.ctaText, { fontSize: Math.round(21 * uiScale) }]}>Nouvelle Commande</Text>
              </LinearGradient>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={goToTableMenu} style={({ pressed }) => [styles.ctaWrap, pressed && styles.scaleDown]}>
            <LinearGradient
              colors={["#19b34f", "#006f2b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <MaterialCommunityIcons name="silverware-variant" size={Math.round(42 * uiScale)} color="#ffffff" />
              <Text style={[styles.ctaText, { fontSize: Math.round(21 * uiScale) }]}>Prendre Commande</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
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
    height: 96,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e9f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0e1c38",
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  occupiedTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 26,
  },
  statusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#007f35",
  },
  statusText: {
    fontFamily: "WorkSans_700Bold",
    color: "#007f35",
    letterSpacing: 3,
  },
  statusDotOccupied: {
    backgroundColor: "#f59e0b",
  },
  statusTextOccupied: {
    color: "#f59e0b",
  },
  statusDotServed: {
    backgroundColor: "#df3338",
  },
  statusTextServed: {
    color: "#df3338",
  },
  guestPill: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: "#e6e9f4",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  guestPillText: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0d1b36",
  },
  openedText: {
    marginTop: 2,
    marginBottom: 22,
    fontFamily: "WorkSans_500Medium",
    color: "#6f7772",
  },
  occupiedSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  occupiedSectionTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#111c2d",
  },
  occupiedCountPill: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#e6e9f4",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  occupiedCountText: {
    fontFamily: "WorkSans_600SemiBold",
    color: "#606873",
  },
  servedCountPill: {
    backgroundColor: "#fbf0de",
  },
  servedCountText: {
    color: "#e49300",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  occupiedOrdersWrap: {
    gap: 14,
  },
  orderCard: {
    minHeight: 146,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e7eaf2",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 16,
  },
  orderRibbon: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: "#f59e0b",
  },
  orderTextWrap: {
    flex: 1,
    paddingLeft: 18,
  },
  orderTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0d1b36",
  },
  orderDetails: {
    marginTop: 6,
    fontFamily: "WorkSans_500Medium",
    color: "#4a534d",
  },
  orderActionWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  orderBadge: {
    minHeight: 54,
    borderRadius: 27,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  orderBadgeReady: {
    backgroundColor: "#f59e0b",
  },
  orderBadgeKitchen: {
    backgroundColor: "#e6e9f4",
  },
  orderBadgeText: {
    fontFamily: "WorkSans_700Bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  orderCheckButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#007f35",
    alignItems: "center",
    justifyContent: "center",
  },
  orderCheckButtonDisabled: {
    backgroundColor: "#e6e9f4",
  },
  servedSectionTitle: {
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 6,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#111c2d",
  },
  orderCardServed: {
    opacity: 0.72,
  },
  orderRibbonServed: {
    backgroundColor: "#df5f66",
  },
  orderTitleServed: {
    textDecorationLine: "line-through",
    color: "#616c7a",
  },
  servedStampWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 2,
  },
  servedStampText: {
    fontFamily: "WorkSans_700Bold",
    color: "#df5f66",
    letterSpacing: 1,
  },
  coversCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2ebe3",
    overflow: "hidden",
    marginBottom: 16,
  },
  coversRibbon: {
    position: "absolute",
    left: 0,
    top: 34,
    bottom: 34,
    width: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#007f35",
  },
  coversTitle: {
    marginLeft: 18,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0d1b36",
    lineHeight: 66,
  },
  coversSubtitle: {
    marginLeft: 18,
    marginTop: 2,
    fontFamily: "WorkSans_500Medium",
    color: "#909792",
  },
  counterWrap: {
    marginTop: 18,
    backgroundColor: "#dde2f0",
    minHeight: 132,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonDisabled: {
    opacity: 0.35,
  },
  counterValue: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0d1b36",
    lineHeight: 72,
    minWidth: 70,
    textAlign: "center",
  },
  capacityCard: {
    minHeight: 144,
    backgroundColor: "#e6e9f4",
    borderWidth: 1,
    borderColor: "#dce3f0",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  capacityIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#c8d5ef",
    alignItems: "center",
    justifyContent: "center",
  },
  capacityTextWrap: {
    flex: 1,
  },
  capacityLabel: {
    fontFamily: "WorkSans_700Bold",
    color: "#8e9591",
    letterSpacing: 2,
  },
  capacityValue: {
    marginTop: 6,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#111c2d",
  },
  bottomDock: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopLeftRadius: 46,
    borderTopRightRadius: 46,
    backgroundColor: "#fbfbff",
    borderTopWidth: 1,
    borderTopColor: "#e9edf5",
  },
  dockHandle: {
    alignSelf: "center",
    width: 86,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#d7d9de",
    marginBottom: 14,
  },
  secondaryActionDisabled: {
    minHeight: 54,
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    opacity: 0.88,
  },
  secondaryActionDisabledText: {
    color: "#989faa",
    fontFamily: "WorkSans_700Bold",
  },
  secondaryActionEnabled: {
    minHeight: 54,
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  secondaryActionEnabledText: {
    color: "#0d1b36",
    fontFamily: "WorkSans_700Bold",
  },
  ctaWrap: {
    borderRadius: 30,
    shadowColor: "#1cae50",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  cta: {
    height: 116,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  ctaText: {
    color: "#ffffff",
    fontFamily: "WorkSans_700Bold",
  },
  scaleDown: {
    transform: [{ scale: 0.96 }],
  },
});
