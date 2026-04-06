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
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { fetchMenuCategories } from "../../../services/posApi";

type CategoryId = number;

type Category = {
  id: CategoryId;
  label: string;
};

type TableMenuItem = {
  id: string;
  categoryId: CategoryId;
  title: string;
  price: number;
  image: string;
  disponible: boolean;
};

type CartPayloadItem = {
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

function parseCartQuantities(rawCart: string): Record<string, number> {
  if (!rawCart) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawCart) as unknown;

    if (!Array.isArray(parsed)) {
      return {};
    }

    const next: Record<string, number> = {};

    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const record = entry as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id : "";
      const quantity = typeof record.quantity === "number" ? Math.max(0, Math.round(record.quantity)) : 0;

      if (!id || quantity <= 0) {
        continue;
      }

      next[id] = quantity;
    }

    return next;
  } catch {
    return {};
  }
}

const ALL_CATEGORY_ID = 0;

export default function TableMenuScreen() {
  const router = useRouter();
  const { tableId, cart, covers, openedAt, status } = useLocalSearchParams<{
    tableId?: string;
    cart?: string | string[];
    covers?: string;
    openedAt?: string;
    status?: string;
  }>();
  const { width, height } = useWindowDimensions();
  const [categories, setCategories] = useState<Category[]>([{ id: ALL_CATEGORY_ID, label: "Tout" }]);
  const [menuItems, setMenuItems] = useState<TableMenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>(ALL_CATEGORY_ID);
  const initialQuantities = useMemo(() => parseCartQuantities(getParamString(cart)), [cart]);
  const [quantities, setQuantities] = useState<Record<string, number>>(initialQuantities);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  useEffect(() => {
    if (isSearchOpen && activeCategoryId !== ALL_CATEGORY_ID) {
      setActiveCategoryId(ALL_CATEGORY_ID);
    }
  }, [isSearchOpen, activeCategoryId]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const apiCategories = await fetchMenuCategories();

        const mappedCategories: Category[] = [
          { id: ALL_CATEGORY_ID, label: "Tout" },
          ...apiCategories.map((category) => ({
            id: category.id,
            label: category.nom,
          })),
        ];

        const mappedItems: TableMenuItem[] = apiCategories.flatMap((category) =>
          category.articles.map((article) => ({
            id: String(article.id),
            categoryId: category.id,
            title: article.nom,
            price: Number(article.prix),
            image: article.image_url ?? "",
            disponible: article.disponibilite,
          })),
        );

        setCategories(mappedCategories);
        setMenuItems(mappedItems);
      } catch {
        setCategories([{ id: ALL_CATEGORY_ID, label: "Tout" }]);
        setMenuItems([]);
      }
    };

    loadMenu();
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuItems.filter((item) => {
      if (!item.disponible) {
        return false;
      }

      if (activeCategoryId !== ALL_CATEGORY_ID && item.categoryId !== activeCategoryId) {
        return false;
      }

      if (!query) {
        return true;
      }

      return item.title.toLowerCase().includes(query);
    });
  }, [activeCategoryId, searchQuery, menuItems]);

  const cartCount = useMemo(() => {
    return Object.values(quantities).reduce((sum, value) => sum + value, 0);
  }, [quantities]);

  const selectedItems = useMemo<CartPayloadItem[]>(() => {
    return menuItems.filter((item) => (quantities[item.id] ?? 0) > 0).map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      quantity: quantities[item.id] ?? 0,
    }));
  }, [quantities, menuItems]);

  const cartTotal = useMemo(() => {
    return menuItems.reduce((sum, item) => sum + (quantities[item.id] ?? 0) * item.price, 0);
  }, [quantities, menuItems]);

  const updateQuantity = (itemId: string, delta: 1 | -1) => {
    setQuantities((prev) => {
      const current = prev[itemId] ?? 0;
      const next = Math.max(0, current + delta);

      return {
        ...prev,
        [itemId]: next,
      };
    });
  };

  const goToCart = () => {
    if (selectedItems.length === 0) {
      return;
    }

    router.push({
      pathname: "/table/[tableId]/cart",
      params: {
        tableId: tableId ?? "12",
        cart: JSON.stringify(selectedItems),
        covers: covers ?? "1",
        openedAt: openedAt ?? "",
        status: status ?? "free",
      },
    });
  };

  if (!jakartaLoaded || !workSansLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerIconButton, pressed && styles.scaleDown]}>
            <MaterialCommunityIcons name="arrow-left" size={Math.round(34 * uiScale)} color="#006f2b" />
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: Math.round(52 * uiScale) }]}>{`Table ${tableId ?? "12"}`}</Text>
        </View>

        <Pressable
          onPress={() => {
            if (isSearchOpen && searchQuery.trim().length > 0) {
              setSearchQuery("");
              return;
            }

            setIsSearchOpen((value) => {
              const next = !value;

              if (next) {
                setActiveCategoryId(ALL_CATEGORY_ID);
              }

              return next;
            });
          }}
          style={({ pressed }) => [styles.headerIconButton, pressed && styles.scaleDown]}
        >
          <MaterialCommunityIcons name="magnify" size={Math.round(34 * uiScale)} color="#006f2b" />
        </Pressable>
      </View>

      {isSearchOpen ? (
        <View style={styles.searchWrap}>
          <View style={styles.searchInputWrap}>
            <MaterialCommunityIcons name="magnify" size={Math.round(22 * uiScale)} color="#5e6775" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              placeholder="Rechercher un plat..."
              placeholderTextColor="#8f96a3"
              style={[styles.searchInput, { fontSize: Math.round(17 * uiScale) }]}
            />
            {searchQuery.length > 0 ? (
              <Pressable onPress={() => setSearchQuery("")} style={({ pressed }) => [styles.clearButton, pressed && styles.scaleDown]}>
                <MaterialCommunityIcons name="close" size={Math.round(18 * uiScale)} color="#66707f" />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.round(118 * verticalScale),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent} style={styles.chipsWrap}>
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;
            return (
              <Pressable
                key={category.id}
                onPress={() => setActiveCategoryId(category.id)}
                style={({ pressed }) => [
                  styles.chip,
                  isActive ? styles.chipActive : styles.chipInactive,
                  pressed && styles.scaleDown,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { fontSize: Math.round(17 * uiScale) },
                    isActive ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.grid}>
          {filteredItems.map((item) => {
            const qty = quantities[item.id] ?? 0;

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.imageWrap}>
                  <Image source={{ uri: item.image }} resizeMode="cover" style={styles.image} />
                </View>

                <Text style={[styles.itemTitle, { fontSize: Math.round(22 * uiScale) }]}>{item.title}</Text>
                <Text style={[styles.itemPrice, { fontSize: Math.round(17 * uiScale) }]}>{`${item.price.toFixed(2)}DH`}</Text>

                <View style={styles.qtyRow}>
                  <Pressable onPress={() => updateQuantity(item.id, -1)} style={({ pressed }) => [styles.qtyButton, pressed && styles.scaleDown]}>
                    <MaterialCommunityIcons name="minus" size={Math.round(26 * uiScale)} color="#00773a" />
                  </Pressable>

                  <Text style={[styles.qtyValue, { fontSize: Math.round(20 * uiScale) }]}>{qty}</Text>

                  <Pressable onPress={() => updateQuantity(item.id, 1)} style={({ pressed }) => [styles.qtyButton, pressed && styles.scaleDown]}>
                    <MaterialCommunityIcons name="plus" size={Math.round(26 * uiScale)} color="#00773a" />
                  </Pressable>
                </View>
              </View>
            );
          })}

          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { fontSize: Math.round(16 * uiScale) }]}>Aucun plat trouve</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          disabled={selectedItems.length === 0}
          onPress={goToCart}
          style={({ pressed }) => [
            styles.cartButtonWrap,
            selectedItems.length === 0 && styles.cartButtonWrapDisabled,
            pressed && selectedItems.length > 0 && styles.scaleDown,
          ]}
        >
          <LinearGradient
            colors={selectedItems.length === 0 ? ["#9ea7b8", "#9ea7b8"] : ["#00722d", "#23c75f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cartButton}
          >
            <View style={styles.cartLeft}>
              <MaterialCommunityIcons name="cart-outline" size={Math.round(36 * uiScale)} color="#ffffff" />
              <Text style={[styles.cartText, { fontSize: Math.round(17 * uiScale) }]}>{`VIEW CART (${cartCount})`}</Text>
            </View>

            <Text style={[styles.cartText, { fontSize: Math.round(17 * uiScale) }]}>{`${cartTotal.toFixed(2)}DH`}</Text>
          </LinearGradient>
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
    height: 86,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  searchInputWrap: {
    minHeight: 54,
    borderRadius: 20,
    backgroundColor: "#e6e9f4",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#111c2d",
    fontFamily: "WorkSans_500Medium",
    paddingVertical: 0,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d7dcea",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8ecf7",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0e1c38",
    letterSpacing: -1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  chipsWrap: {
    marginTop: 8,
    marginBottom: 20,
  },
  chipsContent: {
    gap: 12,
    paddingRight: 6,
  },
  chip: {
    height: 56,
    minWidth: 128,
    borderRadius: 30,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: "#006b2f",
  },
  chipInactive: {
    backgroundColor: "#dfe5f4",
  },
  chipText: {
    fontFamily: "WorkSans_700Bold",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  chipTextInactive: {
    color: "#12203c",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 24,
  },
  emptyState: {
    width: "100%",
    minHeight: 80,
    borderRadius: 18,
    backgroundColor: "#e6e9f4",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    color: "#5f6773",
    fontFamily: "WorkSans_600SemiBold",
  },
  card: {
    width: "48.2%",
  },
  imageWrap: {
    height: 210,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#dce2f1",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  itemTitle: {
    marginTop: 10,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#111c2d",
    lineHeight: 31,
  },
  itemPrice: {
    marginTop: 6,
    fontFamily: "WorkSans_700Bold",
    color: "#006b2f",
  },
  qtyRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  qtyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e6e9f4",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    minWidth: 24,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#111c2d",
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "rgba(242, 243, 248, 0.96)",
  },
  cartButtonWrap: {
    borderRadius: 34,
    shadowColor: "#1cae50",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cartButtonWrapDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  cartButton: {
    height: 96,
    borderRadius: 34,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cartText: {
    color: "#ffffff",
    fontFamily: "WorkSans_700Bold",
  },
  scaleDown: {
    transform: [{ scale: 0.96 }],
  },
});
