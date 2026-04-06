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
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { createCommande, fetchTables, getCurrentUserId } from "../../../services/posApi";

type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

function getParamString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parseCartItems(rawCart: string): CartItem[] {
  if (!rawCart) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawCart) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const record = item as Record<string, unknown>;
        const id = typeof record.id === "string" ? record.id : "";
        const title = typeof record.title === "string" ? record.title : "Article";
        const price = typeof record.price === "number" ? record.price : 0;
        const image = typeof record.image === "string" ? record.image : "";
        const quantity = typeof record.quantity === "number" ? Math.max(0, Math.round(record.quantity)) : 0;

        if (!id || quantity <= 0) {
          return null;
        }

        return { id, title, price, image, quantity };
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export default function TableCartScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{ tableId?: string; cart?: string | string[]; covers?: string; openedAt?: string; status?: string }>();

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
  const covers = Number(params.covers ?? 1);
  const openedAt = params.openedAt;
  const sourceStatus = params.status;
  const initialItems = useMemo(() => parseCartItems(getParamString(params.cart)), [params.cart]);
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uiScale = Math.max(0.72, Math.min(width / 430, 1));
  const verticalScale = Math.max(0.82, Math.min(height / 900, 1));

  const uniqueItemsCount = items.length;
  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const changeQuantity = (itemId: string, delta: 1 | -1) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          const nextQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const goBackToMenu = () => {
    router.push({
      pathname: "/table/[tableId]/menu",
      params: {
        tableId,
        cart: JSON.stringify(items),
        covers: String(covers),
        openedAt: openedAt ?? "",
        status: sourceStatus ?? "free",
      },
    });
  };

  const cancelOrder = () => {
    setItems([]);
    router.replace({
      pathname: "/table/[tableId]",
      params: {
        tableId,
        status: sourceStatus ?? "free",
        openedAt: openedAt ?? "",
        covers: String(Math.max(1, covers)),
      },
    });
  };

  const sendToKitchen = async () => {
    if (items.length === 0 || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const userId = getCurrentUserId();
      const tableNumero = Number(tableId);
      if (!userId || Number.isNaN(tableNumero)) {
        return;
      }

      const tables = await fetchTables();
      const table = tables.find((entry) => entry.numero === tableNumero);
      if (!table) {
        return;
      }

      await createCommande({
        table_id: table.id,
        couverts: Math.max(1, covers),
        utilisateur_id: userId,
        lignes: items.map((item) => ({
          article_id: Number(item.id),
          quantite: item.quantity,
        })),
      });

      const nowLabel = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const effectiveOpenedAt = sourceStatus === "occupied" && openedAt ? openedAt : nowLabel;

      router.replace({
        pathname: "/table/[tableId]",
        params: {
          tableId,
          status: "occupied",
          openedAt: effectiveOpenedAt,
          covers: String(Math.max(1, covers)),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!jakartaLoaded || !workSansLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: Math.round(22 * uiScale) }]}>{`Table ${tableId}`}</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.round(250 * verticalScale),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.cartTitle, { fontSize: Math.round(60 * uiScale) }]}>Panier</Text>
            <Text style={[styles.itemCountText, { fontSize: Math.round(20 * uiScale) }]}>
              {`${uniqueItemsCount} Articles`}
            </Text>
          </View>
          <MaterialCommunityIcons name="cart" size={Math.round(44 * uiScale)} color="#007b37" />
        </View>

        <View style={styles.itemsList}>
          {items.map((item) => {
            const lineTotal = item.price * item.quantity;

            return (
              <View key={item.id} style={styles.itemCard}>
                <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />

                <View style={styles.itemBody}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.itemTextBlock}>
                      <Text style={[styles.itemTitle, { fontSize: Math.round(22 * uiScale) }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={[styles.itemSub, { fontSize: Math.round(14 * uiScale) }]}>{`${item.price.toFixed(2)} par espece`}</Text>
                    </View>
                    <Text style={[styles.itemTotal, { fontSize: Math.round(28 * uiScale) }]}>{`${lineTotal.toFixed(2)}DH`}</Text>
                  </View>

                  <View style={styles.itemBottomRow}>
                    <View style={styles.stepper}>
                      <Pressable
                        onPress={() => changeQuantity(item.id, -1)}
                        style={({ pressed }) => [styles.stepperBtn, styles.stepperBtnMuted, pressed && styles.scaleDown]}
                      >
                        <MaterialCommunityIcons name="minus" size={Math.round(24 * uiScale)} color="#007b37" />
                      </Pressable>
                      <Text style={[styles.stepperValue, { fontSize: Math.round(22 * uiScale) }]}>{item.quantity}</Text>
                      <Pressable
                        onPress={() => changeQuantity(item.id, 1)}
                        style={({ pressed }) => [styles.stepperBtn, styles.stepperBtnPrimary, pressed && styles.scaleDown]}
                      >
                        <MaterialCommunityIcons name="plus" size={Math.round(24 * uiScale)} color="#ffffff" />
                      </Pressable>
                    </View>

                    <Pressable onPress={() => removeItem(item.id)} style={({ pressed }) => [styles.removeBtn, pressed && styles.scaleDown]}>
                      <MaterialCommunityIcons name="delete-outline" size={Math.round(24 * uiScale)} color="#a94b3d" />
                      <Text style={[styles.removeText, { fontSize: Math.round(17 * uiScale) }]}>Supprimer</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable onPress={goBackToMenu} style={({ pressed }) => [styles.addMoreCard, pressed && styles.scaleDown]}>
          <MaterialCommunityIcons name="plus-circle" size={Math.round(44 * uiScale)} color="#7a8f7d" />
          <Text style={[styles.addMoreText, { fontSize: Math.round(22 * uiScale) }]}>Ajouter autre article</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footerWrap}>
        <View style={styles.footerTopRow}>
          <Text style={[styles.grandTotalLabel, { fontSize: Math.round(23 * uiScale) }]}>Montant Total</Text>
          <Text style={[styles.grandTotalValue, { fontSize: Math.round(56 * uiScale) }]}>{`${grandTotal.toFixed(2)}DH`}</Text>
        </View>

        <Pressable
          disabled={items.length === 0}
          onPress={cancelOrder}
          style={({ pressed }) => [
            styles.footerButton,
            styles.cancelButton,
            items.length === 0 && styles.actionDisabled,
            pressed && items.length > 0 && styles.scaleDown,
          ]}
        >
          <MaterialCommunityIcons name="close-circle-outline" size={Math.round(38 * uiScale)} color="#ffffff" />
          <Text style={[styles.footerButtonText, { fontSize: Math.round(22 * uiScale) }]}>Annuler Commande</Text>
        </Pressable>

        <Pressable
          disabled={items.length === 0 || isSubmitting}
          onPress={sendToKitchen}
          style={({ pressed }) => [
            styles.footerButton,
            styles.sendButton,
            (items.length === 0 || isSubmitting) && styles.actionDisabled,
            pressed && items.length > 0 && !isSubmitting && styles.scaleDown,
          ]}
        >
          <MaterialCommunityIcons name="send" size={Math.round(34 * uiScale)} color="#ffffff" />
          <Text style={[styles.footerButtonText, { fontSize: Math.round(22 * uiScale) }]}> 
            {isSubmitting ? "Validation..." : "Valider la Commande"}
          </Text>
        </Pressable>
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
    height: 84,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#f7f8fb",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe5ef",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0f1f39",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  cartTitle: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0f1f39",
    lineHeight: 64,
    letterSpacing: -1,
  },
  itemCountText: {
    marginTop: 2,
    fontFamily: "WorkSans_500Medium",
    color: "#6d7c6e",
  },
  itemsList: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e7ecf5",
  },
  itemImage: {
    width: 102,
    height: 102,
    borderRadius: 18,
    backgroundColor: "#d8deeb",
  },
  itemBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTextBlock: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#111c2d",
    lineHeight: 28,
  },
  itemSub: {
    marginTop: 3,
    fontFamily: "WorkSans_500Medium",
    color: "#6f7e6f",
  },
  itemTotal: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#111c2d",
  },
  itemBottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6ebf8",
    borderRadius: 999,
    padding: 4,
    gap: 10,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnMuted: {
    backgroundColor: "#f7f9fe",
  },
  stepperBtnPrimary: {
    backgroundColor: "#007b37",
  },
  stepperValue: {
    minWidth: 18,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0f1f39",
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  removeText: {
    fontFamily: "WorkSans_700Bold",
    color: "#a94b3d",
  },
  addMoreCard: {
    marginTop: 18,
    minHeight: 132,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#b8c9b5",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addMoreText: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#5c6f5c",
  },
  footerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderTopColor: "#e5ebf4",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 14,
    shadowColor: "#111c2d",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 18,
  },
  footerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  grandTotalLabel: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#101d35",
  },
  grandTotalValue: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#007b37",
    letterSpacing: -1,
  },
  footerButton: {
    height: 74,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#df3137",
  },
  sendButton: {
    backgroundColor: "#00a042",
  },
  footerButtonText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#ffffff",
  },
  actionDisabled: {
    opacity: 0.45,
  },
  scaleDown: {
    transform: [{ scale: 0.96 }],
  },
});
