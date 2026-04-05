import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArticleCard, CategoryTabs } from "../components";
import { useCartStore } from "../stores";
import { menuService } from "../services";
import { Category, Article } from "../types";

const ArrowLeftIcon = () => <Text className="text-2xl text-gray-800">←</Text>;
const SearchIcon = () => <Text className="text-xl text-gray-800">🔍</Text>;
const CartIcon = () => <Text className="text-lg">🛒</Text>;

interface MenuScreenProps {
  navigation?: any;
  route?: { params?: { tableId?: number } };
  onNavigateToCart?: () => void;
  onGoBack?: () => void;
}

export default function MenuScreen({
  navigation,
  route,
  onNavigateToCart,
  onGoBack,
}: MenuScreenProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    tableId,
    setTableId,
    addItem,
    removeItem,
    getItemCount,
    getTotalPrice,
    getItemQuantity,
  } = useCartStore();

  useEffect(() => {
    if (route?.params?.tableId) {
      setTableId(route.params.tableId);
    }
  }, [route?.params?.tableId, setTableId]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getMenu();
      setCategories(data.categories);

      if (data.categories.length > 0) {
        setActiveCategory(data.categories[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch menu:", err);
      setError("Impossible de charger le menu. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = useMemo(() => {
    if (!activeCategory) return [];
    const category = categories.find((c) => c.id === activeCategory);
    return category?.articles ?? [];
  }, [categories, activeCategory]);

  const categoryTabs = useMemo(() => {
    return categories.map((c) => ({ id: c.id, nom: c.nom }));
  }, [categories]);

  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

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

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-lg text-red-500">{error}</Text>
          <Pressable onPress={fetchMenu} className="rounded-full bg-green-brand px-6 py-3">
            <Text className="font-semibold text-white">Reessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <Pressable
          onPress={handleGoBack}
          className="h-10 w-10 items-center justify-center"
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <ArrowLeftIcon />
        </Pressable>

        <Text className="text-lg font-bold text-gray-900">Table {tableId ?? "-"}</Text>

        <Pressable
          onPress={() => {
            // TODO: search
          }}
          className="h-10 w-10 items-center justify-center"
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <SearchIcon />
        </Pressable>
      </View>

      <View className="bg-white">
        <CategoryTabs categories={categoryTabs} activeId={activeCategory ?? 0} onSelect={setActiveCategory} />
      </View>

      <FlatList
        data={filteredArticles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500">Aucun article dans cette categorie</Text>
          </View>
        }
      />

      {itemCount > 0 && (
        <Pressable
          onPress={handleNavigateToCart}
          style={({ pressed }) => [styles.cartBar, pressed && styles.cartBarPressed]}
        >
          <View className="flex-row items-center">
            <CartIcon />
            <Text className="ml-2 font-bold text-white">VOIR PANIER ({itemCount})</Text>
          </View>
          <Text className="font-bold text-white">{totalPrice.toFixed(2)} MAD</Text>
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
    paddingBottom: 100,
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
