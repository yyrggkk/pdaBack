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

type CategoryId = 0 | 1 | 2 | 3 | 4;

type Category = {
  id: CategoryId;
  label: "Tout" | "Mains" | "Starters" | "Sides" | "Desserts";
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

const CATEGORIES: Category[] = [
  { id: 0, label: "Tout" },
  { id: 1, label: "Mains" },
  { id: 2, label: "Starters" },
  { id: 3, label: "Sides" },
  { id: 4, label: "Desserts" },
];

const MENU_ITEMS: TableMenuItem[] = [
  {
    id: "1",
    categoryId: 1,
    title: "Signature Smokehouse Burger",
    price: 18.5,
    disponible: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1sC2FvMVa1jqH2pNzJzlZP-UIJMbaAaeu4HhqT7pj0SXfPfWex_BxUXaB-TLjmNr1zfYHqN62dHeq5BcB89Y65GlQLIjfQkoGv1iJfGc0HgbUoIH5PYzudlvShbMG0y1hyOmheQiggZBf3oC3isE5j41nHs1lV8JpzpzMSwtr2vE_ht6jwuKHBUrpRTwfWP5KF4YBdaE35Hmlw9YKbREY8SZfTusA_nOEsgphkGop_4P2TlVy_dzNT9o7q-c3LJ_oEjplbTh8WFQ",
  },
  {
    id: "2",
    categoryId: 1,
    title: "Wild Atlantic Salmon",
    price: 24,
    disponible: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqSlljLniBwvB5ArKRIKWfBm3KM6b7HZia5Z4aLfqdW5JWsABGNMQLZG3LYfNn6AvkixATUg8DEupvUEmu9YXTitOuOXO0fat28IXwevTpvt4xA1aKcKc7QshRLSyIUHHJt7Ot2QfZLqASQ5iBx5_qnyuHT_zrLz1fE-ui0Fa2HaWRJMH9Oqt-Zc0GL6Uc5EaVbGmaOJu_EpPrHQgXp0sHj0lt2b_dhaCgItVYGD5Z_xW2ZxUf6vauOY2cdhFBSpHmuU5NuyBj2Q8",
  },
  {
    id: "3",
    categoryId: 1,
    title: "Black Truffle Tagliatelle",
    price: 22,
    disponible: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5XjQUg7zeXcMv-EJ1JG1SYFwfYe_M-Zb6pC85Re14vr7bULP2LeaN_TR66rOjWY12l1jn9VhF0Se6p0cICpuO7KsE4rU8ANJ3-FA-mnAqzKoQovq_o-ZvuhK9aUqmxG8nQFpDDfKXJn6ggG1oFIp3sPuw466_X1k1TVMJ0rHk_RI8VcAWkYKthc-VxaIQPqf1i4acdj8QVZzfOo5zKIaMj7uelFhOEKieHbThhhYmJFGn-Iq2KiE6E3Kpr01RbtZhu3cdiHiwcF0",
  },
  {
    id: "4",
    categoryId: 1,
    title: "Roasted Heritage Chicken",
    price: 19.5,
    disponible: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFicAGwCAjA3i_vW1FSEgbgKugZ32MEI7wrf4CM84dHFbtIfX9VwLXNJ8exM0Z9nWkARN6uwzbIhbKXNKI-DiCOT7jNhyqM1uC1heeq3Tl8dWcuYBBetXDJiCjNEes7TtHLYbwZ9tEg2g4QX95uXFz_yXIb4Smr7f_KXNw5bpdR5mhMsNv1xlJy6JLq4QMczP1IG5RbuOsSXvj35hdan0FsfYj3EORJaL5xCrmwhZMT1CdaVM01-JbyMTPJ7tE1Ulz7P2VgR7oaDI",
  },
  {
    id: "5",
    categoryId: 2,
    title: "Carpaccio de Boeuf",
    price: 12,
    disponible: true,
    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "6",
    categoryId: 2,
    title: "Veloute de Champignons",
    price: 9.5,
    disponible: true,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "7",
    categoryId: 3,
    title: "Pommes Rissolees",
    price: 7,
    disponible: true,
    image: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "8",
    categoryId: 3,
    title: "Legumes Grilles",
    price: 8.5,
    disponible: true,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "9",
    categoryId: 4,
    title: "Fondant Chocolat",
    price: 10,
    disponible: true,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "10",
    categoryId: 4,
    title: "Tarte Citron",
    price: 9,
    disponible: false,
    image: "https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=900&q=80",
  },
];

export default function TableMenuScreen() {
  const router = useRouter();
  const { tableId, cart } = useLocalSearchParams<{ tableId?: string; cart?: string | string[] }>();
  const { width, height } = useWindowDimensions();
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>(1);
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
    if (isSearchOpen && activeCategoryId !== 0) {
      setActiveCategoryId(0);
    }
  }, [isSearchOpen, activeCategoryId]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return MENU_ITEMS.filter((item) => {
      if (!item.disponible) {
        return false;
      }

      if (activeCategoryId !== 0 && item.categoryId !== activeCategoryId) {
        return false;
      }

      if (!query) {
        return true;
      }

      return item.title.toLowerCase().includes(query);
    });
  }, [activeCategoryId, searchQuery]);

  const cartCount = useMemo(() => {
    return Object.values(quantities).reduce((sum, value) => sum + value, 0);
  }, [quantities]);

  const selectedItems = useMemo<CartPayloadItem[]>(() => {
    return MENU_ITEMS.filter((item) => (quantities[item.id] ?? 0) > 0).map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      quantity: quantities[item.id] ?? 0,
    }));
  }, [quantities]);

  const cartTotal = useMemo(() => {
    return MENU_ITEMS.reduce((sum, item) => sum + (quantities[item.id] ?? 0) * item.price, 0);
  }, [quantities]);

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
                setActiveCategoryId(0);
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
          {CATEGORIES.map((category) => {
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
