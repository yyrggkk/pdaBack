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
import { ArticleCard, CategoryTabs } from "../components";
import { useCartStore } from "../stores";
import { menuService } from "../services";
import { Category, Article } from "../types";

// Placeholder icons - replace with your icon library (e.g., @expo/vector-icons)
const ArrowLeftIcon = () => (
  <Text className="text-2xl text-gray-800">←</Text>
);
const SearchIcon = () => (
  <Text className="text-xl text-gray-800">🔍</Text>
);
const CartIcon = () => (
  <Text className="text-lg">🛒</Text>
);

interface MenuScreenProps {
  navigation?: any; // Replace with proper navigation type if using React Navigation
  onNavigateToCart?: () => void;
  onGoBack?: () => void;
}

export default function MenuScreen({
  navigation,
  onNavigateToCart,
  onGoBack,
}: MenuScreenProps) {
  const insets = useSafeAreaInsets();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart store
  const {
    tableId,
    addItem,
    removeItem,
    getItemCount,
    getTotalPrice,
    getItemQuantity,
  } = useCartStore();

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
    return categories.map((c) => ({ id: c.id, nom: c.nom }));
  }, [categories]);

  // Cart computed values
  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

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

  const handleNavigateToCart = () => {
    if (onNavigateToCart) {
      onNavigateToCart();
    } else if (navigation?.navigate) {
      navigation.navigate("Panier");
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
      quantity={getItemQuantity(item.id)}
      onAdd={() => handleAddItem(item)}
      onRemove={() => handleRemoveItem(item.id)}
    />
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1B7A4A" />
          <Text className="mt-4 text-gray-600">Chargement du menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center text-lg mb-4">{error}</Text>
          <Pressable
            onPress={fetchMenu}
            className="bg-green-brand px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        {/* Back Button */}
        <Pressable
          onPress={handleGoBack}
          className="w-10 h-10 items-center justify-center"
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <ArrowLeftIcon />
        </Pressable>

        {/* Title */}
        <Text className="text-lg font-bold text-gray-900">
          Table {tableId ?? "-"}
        </Text>

        {/* Search Button */}
        <Pressable
          onPress={() => {
            // TODO: Implement search
          }}
          className="w-10 h-10 items-center justify-center"
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <SearchIcon />
        </Pressable>
      </View>

      {/* Category Tabs */}
      <View className="bg-white">
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
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500">Aucun article dans cette catégorie</Text>
          </View>
        }
      />

      {/* Floating Cart Bar */}
      {itemCount > 0 && (
        <Pressable
          onPress={handleNavigateToCart}
          style={({ pressed }) => [
            styles.cartBar,
            { bottom: 16 + insets.bottom },
            pressed && styles.cartBarPressed,
          ]}
        >
          <View className="flex-row items-center">
            <CartIcon />
            <Text className="text-white font-bold ml-2">
              VOIR PANIER ({itemCount})
            </Text>
          </View>
          <Text className="text-white font-bold">
            {totalPrice.toFixed(2)} MAD
          </Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  listContent: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  cartBar: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#1B7A4A",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#1B7A4A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cartBarPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
