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
import BottomNavBar from "../components/BottomNavBar";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type MenuCategory = {
  id: 1 | 2 | 3 | 4;
  label: "Mains" | "Starters" | "Sides" | "Desserts";
};

type MenuScreenProps = {
  showBottomNav?: boolean;
};

type MenuItem = {
  id: string;
  categoryId: MenuCategory["id"];
  title: string;
  price: string;
  image: string;
  disponible: boolean;
};

const CATEGORIES: MenuCategory[] = [
  { id: 1, label: "Mains" },
  { id: 2, label: "Starters" },
  { id: 3, label: "Sides" },
  { id: 4, label: "Desserts" },
];

const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    categoryId: 1,
    title: "Signature Smokehouse Burger",
    price: "18.50DH",
    disponible: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1sC2FvMVa1jqH2pNzJzlZP-UIJMbaAaeu4HhqT7pj0SXfPfWex_BxUXaB-TLjmNr1zfYHqN62dHeq5BcB89Y65GlQLIjfQkoGv1iJfGc0HgbUoIH5PYzudlvShbMG0y1hyOmheQiggZBf3oC3isE5j41nHs1lV8JpzpzMSwtr2vE_ht6jwuKHBUrpRTwfWP5KF4YBdaE35Hmlw9YKbREY8SZfTusA_nOEsgphkGop_4P2TlVy_dzNT9o7q-c3LJ_oEjplbTh8WFQ",
  },
  {
    id: "2",
    categoryId: 1,
    title: "Wild Atlantic Salmon",
    price: "24.00DH",
    disponible: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqSlljLniBwvB5ArKRIKWfBm3KM6b7HZia5Z4aLfqdW5JWsABGNMQLZG3LYfNn6AvkixATUg8DEupvUEmu9YXTitOuOXO0fat28IXwevTpvt4xA1aKcKc7QshRLSyIUHHJt7Ot2QfZLqASQ5iBx5_qnyuHT_zrLz1fE-ui0Fa2HaWRJMH9Oqt-Zc0GL6Uc5EaVbGmaOJu_EpPrHQgXp0sHj0lt2b_dhaCgItVYGD5Z_xW2ZxUf6vauOY2cdhFBSpHmuU5NuyBj2Q8",
  },
  {
    id: "3",
    categoryId: 1,
    title: "Black Truffle Tagliatelle",
    price: "22.00DH",
    disponible: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5XjQUg7zeXcMv-EJ1JG1SYFwfYe_M-Zb6pC85Re14vr7bULP2LeaN_TR66rOjWY12l1jn9VhF0Se6p0cICpuO7KsE4rU8ANJ3-FA-mnAqzKoQovq_o-ZvuhK9aUqmxG8nQFpDDfKXJn6ggG1oFIp3sPuw466_X1k1TVMJ0rHk_RI8VcAWkYKthc-VxaIQPqf1i4acdj8QVZzfOo5zKIaMj7uelFhOEKieHbThhhYmJFGn-Iq2KiE6E3Kpr01RbtZhu3cdiHiwcF0",
  },
  {
    id: "4",
    categoryId: 1,
    title: "Roasted Heritage Chicken",
    price: "19.50DH",
    disponible: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFicAGwCAjA3i_vW1FSEgbgKugZ32MEI7wrf4CM84dHFbtIfX9VwLXNJ8exM0Z9nWkARN6uwzbIhbKXNKI-DiCOT7jNhyqM1uC1heeq3Tl8dWcuYBBetXDJiCjNEes7TtHLYbwZ9tEg2g4QX95uXFz_yXIb4Smr7f_KXNw5bpdR5mhMsNv1xlJy6JLq4QMczP1IG5RbuOsSXvj35hdan0FsfYj3EORJaL5xCrmwhZMT1CdaVM01-JbyMTPJ7tE1Ulz7P2VgR7oaDI",
  },
  {
    id: "5",
    categoryId: 2,
    title: "Carpaccio de Boeuf",
    price: "12.00DH",
    disponible: true,
    image:
      "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "6",
    categoryId: 2,
    title: "Veloute de Champignons",
    price: "9.50DH",
    disponible: true,
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "7",
    categoryId: 3,
    title: "Pommes Rissolees",
    price: "7.00DH",
    disponible: true,
    image:
      "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "8",
    categoryId: 3,
    title: "Legumes Grilles",
    price: "8.50DH",
    disponible: true,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "9",
    categoryId: 4,
    title: "Fondant Chocolat",
    price: "10.00DH",
    disponible: true,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "10",
    categoryId: 4,
    title: "Tarte Citron",
    price: "9.00DH",
    disponible: false,
    image:
      "https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=900&q=80",
  },
];

export function MenuScreen({ showBottomNav = true }: MenuScreenProps = {}) {
  const { width, height } = useWindowDimensions();
  const [activeCategoryId, setActiveCategoryId] = useState<MenuCategory["id"]>(1);

  const [jakartaLoaded] = useJakartaFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [workSansLoaded] = useWorkSansFonts({
    WorkSans_500Medium,
    WorkSans_600SemiBold,
  });

  const uiScale = Math.max(0.72, Math.min(width / 430, 1));
  const verticalScale = Math.max(0.82, Math.min(height / 900, 1));
  const cardWidth = Math.max(136, (width - 62) / 2);
  const imageHeight = Math.round(cardWidth * 1.26);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => item.categoryId === activeCategoryId);
  }, [activeCategoryId]);

  if (!jakartaLoaded || !workSansLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <MaterialCommunityIcons name="silverware-variant" size={Math.round(25 * uiScale)} color="#00773a" />
          <Text style={[styles.topTitle, { fontSize: Math.round(43 * uiScale) }]}>Menu</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.searchButton, pressed && styles.scaleDown]}>
          <MaterialCommunityIcons name="magnify" size={Math.round(29 * uiScale)} color="#00773a" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.round(126 * verticalScale),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
          style={styles.chipsWrap}
        >
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
                    {
                      fontSize: Math.round(17 * uiScale),
                    },
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
          {filteredItems.map((item) => (
            <View key={item.id} style={[styles.card, { width: cardWidth }]}> 
              <View
                style={[
                  styles.imageWrap,
                  {
                    height: imageHeight,
                    borderRadius: Math.round(30 * uiScale),
                  },
                ]}
              >
                <Image source={{ uri: item.image }} resizeMode="cover" style={styles.image} />

                {!item.disponible && (
                  <View style={styles.soldOutOverlay}>
                    <View style={styles.soldOutPill}>
                      <Text style={[styles.soldOutText, { fontSize: Math.round(13 * uiScale) }]}>SOLD OUT</Text>
                    </View>
                  </View>
                )}
              </View>

              <Text style={[styles.itemTitle, { fontSize: Math.round(23 * uiScale) }]}>{item.title}</Text>
              <Text style={[styles.itemPrice, !item.disponible && styles.itemPriceMuted, { fontSize: Math.round(17 * uiScale) }]}>
                {item.price}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {showBottomNav ? <BottomNavBar activeTab="menu" /> : null}
    </SafeAreaView>
  );
}

export default function MenuRoute() {
  return <MenuScreen />;
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
  topBar: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topTitle: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0e1c38",
    letterSpacing: -1.1,
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  chipsWrap: {
    marginTop: 6,
    marginBottom: 24,
  },
  chipsContent: {
    gap: 12,
    paddingRight: 6,
  },
  chip: {
    height: 56,
    minWidth: 126,
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
    fontFamily: "WorkSans_600SemiBold",
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
    rowGap: 28,
  },
  card: {
    marginBottom: 4,
  },
  imageWrap: {
    overflow: "hidden",
    backgroundColor: "#e5eaf6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 27, 40, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldOutPill: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  soldOutText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#b61622",
    letterSpacing: 2,
  },
  itemTitle: {
    marginTop: 12,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#111c2d",
    lineHeight: 31,
  },
  itemPrice: {
    marginTop: 8,
    fontFamily: "WorkSans_600SemiBold",
    color: "#006b2f",
  },
  itemPriceMuted: {
    color: "#7f988b",
  },
  scaleDown: {
    transform: [{ scale: 0.96 }],
  },
});
