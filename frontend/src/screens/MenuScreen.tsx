import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArticleCard, CategoryTabs } from "../components";
import { useCartStore } from "../stores";
import { menuService } from "../services";
import { Category, Article } from "../types";

interface MenuScreenProps {
  navigation?: any;
  route?: any;
  isOrderMode?: boolean;
  onNavigateToCart?: () => void;
  onGoBack?: () => void;
}

export default function MenuScreen({
  navigation,
  route,
  isOrderMode,
  onGoBack,
}: MenuScreenProps) {
  const insets = useSafeAreaInsets();
  const isOrderModeEnabled = Boolean(isOrderMode ?? route?.params?.isOrderMode);

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart store
  const { addItem, removeItem, getItemQuantity } = useCartStore();

  // Fetch menu on mount
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getMenu();
      setCategories(data.categories);
      
      // Set first category as active by default
      if (data.categories.length > 0) {
        setActiveCategory(data.categories[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch menu:", err);
      setError("Impossible de charger le menu. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Filter articles by selected category
  const filteredArticles = useMemo(() => {
    if (!activeCategory) return [];
    const category = categories.find((c) => c.id === activeCategory);
    return category?.articles ?? [];
  }, [categories, activeCategory]);

  // Category tabs data
  const categoryTabs = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      nom: c.nom === "Entrees Marocaines" ? "Entrées Marocaines" : c.nom,
    }));
  }, [categories]);

  // Handlers
  const handleAddItem = (article: Article) => {
    addItem({
      article_id: article.id,
      nom: article.nom,
      prix: article.prix,
      image_url: article.image_url ?? "",
    });
  };

  const handleRemoveItem = (articleId: number) => {
    removeItem(articleId);
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  // Render article item
  const renderArticle = ({ item }: { item: Article }) => (
    <ArticleCard
      id={item.id}
      nom={item.nom}
      prix={item.prix}
      description={item.description ?? undefined}
      image_url={item.image_url ?? "https://via.placeholder.com/200"}
      disponibilite={item.disponibilite}
      quantity={isOrderModeEnabled ? getItemQuantity(item.id) : 0}
      onAdd={isOrderModeEnabled ? () => handleAddItem(item) : undefined}
      onRemove={isOrderModeEnabled ? () => handleRemoveItem(item.id) : undefined}
      showQuantityControls={isOrderModeEnabled}
    />
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B7A4A" />
          <Text style={styles.loadingText}>Chargement du menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchMenu} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <Pressable
          onPress={handleGoBack}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>

        {/* Title */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Menu</Text>
        </View>

        {/* Search Button */}
        <Pressable
          onPress={() => {}}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="search" size={24} color="#111827" />
        </Pressable>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <CategoryTabs
          categories={categoryTabs}
          activeId={activeCategory ?? 0}
          onSelect={setActiveCategory}
        />
      </View>

      {/* Articles Grid */}
      <FlatList
        data={filteredArticles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 20 + insets.bottom },
        ]}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Aucun article dans cette catégorie</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#1B7A4A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#9CA3AF",
    marginTop: 12,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: "#F3F4F6",
  },
});
