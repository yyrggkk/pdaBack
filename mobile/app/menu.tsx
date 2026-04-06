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
import { useEffect, useMemo, useState } from "react";
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
import { fetchMenuCategories } from "../services/posApi";

type MenuCategory = {
  id: number;
  label: string;
};

type MenuScreenProps = {
  showBottomNav?: boolean;
};

type MenuItem = {
  id: string;
  categoryId: number;
  title: string;
  price: string;
  image: string;
  disponible: boolean;
};

export function MenuScreen({ showBottomNav = true }: MenuScreenProps = {}) {
  const { width, height } = useWindowDimensions();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

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

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const apiCategories = await fetchMenuCategories();

        const mappedCategories: MenuCategory[] = apiCategories.map((category) => ({
          id: category.id,
          label: category.nom,
        }));

        const mappedItems: MenuItem[] = apiCategories.flatMap((category) =>
          category.articles.map((article) => ({
            id: String(article.id),
            categoryId: category.id,
            title: article.nom,
            price: `${Number(article.prix).toFixed(2)}DH`,
            image: article.image_url ?? "",
            disponible: article.disponibilite,
          })),
        );

        setCategories(mappedCategories);
        setMenuItems(mappedItems);

        if (mappedCategories.length > 0) {
          setActiveCategoryId(mappedCategories[0].id);
        }
      } catch {
        setCategories([]);
        setMenuItems([]);
        setActiveCategoryId(null);
      }
    };

    loadMenu();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategoryId === null) {
      return [];
    }

    return menuItems.filter((item) => item.categoryId === activeCategoryId);
  }, [activeCategoryId, menuItems]);

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
