import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore, CartItem } from "../stores";
import { useSubmitOrder } from "../hooks";

// Placeholder icons - replace with your icon library
const ArrowLeftIcon = () => <Text className="text-2xl text-gray-800">←</Text>;
const MoreIcon = () => <Text className="text-xl text-gray-800">⋮</Text>;
const CartIcon = () => <Text className="text-2xl">🛒</Text>;
const TrashIcon = () => <Text className="text-base">🗑️</Text>;
const PlusIcon = () => <Text className="text-lg font-bold text-white">+</Text>;
const MinusIcon = () => <Text className="text-lg font-bold text-gray-700">−</Text>;

interface CartScreenProps {
  navigation?: any;
  onGoBack?: () => void;
  onNavigateToMenu?: () => void;
  onOrderSuccess?: () => void;
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  disabled?: boolean;
}

function CartItemCard({ item, onUpdateQuantity, onRemove, disabled }: CartItemCardProps) {
  return (
    <View 
      className="flex-row bg-white rounded-xl p-3 mb-3" 
      style={[styles.card, disabled && styles.disabledCard]}
    >
      {/* Product Image */}
      <Image
        source={{ uri: item.image_url || "https://via.placeholder.com/80" }}
        className="w-20 h-20 rounded-lg"
        resizeMode="cover"
      />

      {/* Content */}
      <View className="flex-1 ml-3 justify-between">
        {/* Name and Remove */}
        <View className="flex-row justify-between items-start">
          <Text className="font-bold text-gray-900 text-base flex-1 mr-2" numberOfLines={2}>
            {item.nom}
          </Text>
          <Pressable
            onPress={onRemove}
            disabled={disabled}
            className="flex-row items-center"
            style={({ pressed }) => [pressed && !disabled && styles.pressed]}
          >
            <TrashIcon />
            <Text className={`text-sm ml-1 ${disabled ? "text-gray-400" : "text-red-500"}`}>
              Supprimer
            </Text>
          </Pressable>
        </View>

        {/* Price and Quantity */}
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-green-brand font-semibold text-base">
            {item.prix.toFixed(2)} MAD
          </Text>

          {/* Quantity Stepper */}
          <View className="flex-row items-center">
            {/* Minus Button */}
            <Pressable
              onPress={() => onUpdateQuantity(item.quantite - 1)}
              disabled={disabled}
              className={`w-8 h-8 rounded-full items-center justify-center ${
                disabled ? "bg-gray-100" : "bg-gray-200"
              }`}
              style={({ pressed }) => [pressed && !disabled && styles.pressed]}
            >
              <MinusIcon />
            </Pressable>

            {/* Quantity */}
            <Text className="mx-4 font-bold text-gray-900 text-base min-w-[24px] text-center">
              {item.quantite}
            </Text>

            {/* Plus Button */}
            <Pressable
              onPress={() => onUpdateQuantity(item.quantite + 1)}
              disabled={disabled}
              className={`w-8 h-8 rounded-full items-center justify-center ${
                disabled ? "bg-gray-300" : "bg-green-brand"
              }`}
              style={({ pressed }) => [pressed && !disabled && styles.pressed]}
            >
              <PlusIcon />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen({
  navigation,
  onGoBack,
  onNavigateToMenu,
  onOrderSuccess,
}: CartScreenProps) {
  const {
    items,
    tableId,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    getTotalPrice,
  } = useCartStore();

  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  // Submit order hook
  const { submitOrder, isSubmitting, error, clearError } = useSubmitOrder({
    onSuccess: (order) => {
      Alert.alert(
        "Commande envoyée !",
        `Commande #${order.id} envoyée en cuisine.\nTotal: ${order.total.toFixed(2)} MAD`,
        [
          {
            text: "OK",
            onPress: () => {
              if (onOrderSuccess) {
                onOrderSuccess();
              } else if (navigation?.navigate) {
                // Navigate to tables screen or home
                navigation.navigate("TablesPlanHome");
              } else {
                handleGoBack();
              }
            },
          },
        ]
      );
    },
    onError: (errorMessage) => {
      Alert.alert("Erreur", errorMessage, [{ text: "OK" }]);
    },
  });

  // Clear error when component unmounts or items change
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Handlers
  const handleGoBack = () => {
    if (isSubmitting) return; // Prevent navigation during submission
    
    if (onGoBack) {
      onGoBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleNavigateToMenu = () => {
    if (isSubmitting) return;
    
    if (onNavigateToMenu) {
      onNavigateToMenu();
    } else if (navigation?.navigate) {
      navigation.navigate("Menu");
    }
  };

  const handleUpdateQuantity = (articleId: number, quantity: number) => {
    if (isSubmitting) return;
    
    if (quantity <= 0) {
      // Confirm removal
      Alert.alert(
        "Supprimer l'article",
        "Voulez-vous supprimer cet article du panier ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: () => removeItem(articleId),
          },
        ]
      );
    } else {
      updateQuantity(articleId, quantity);
    }
  };

  const handleRemoveItem = (articleId: number) => {
    if (isSubmitting) return;
    
    Alert.alert(
      "Supprimer l'article",
      "Voulez-vous supprimer cet article du panier ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => removeItem(articleId),
        },
      ]
    );
  };

  const handleCancelOrder = () => {
    if (isSubmitting) return;
    
    Alert.alert(
      "Annuler la commande",
      "Voulez-vous vraiment annuler cette commande ? Le panier sera vidé.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: () => {
            clearCart();
            handleGoBack();
          },
        },
      ]
    );
  };

  const handleSendToKitchen = () => {
    if (isSubmitting) return;
    
    Alert.alert(
      "Envoyer en cuisine",
      "Confirmer l'envoi de la commande en cuisine ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => {
            submitOrder();
          },
        },
      ]
    );
  };

  // Empty cart state
  if (items.length === 0 && !isSubmitting) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <Pressable
            onPress={handleGoBack}
            className="w-10 h-10 items-center justify-center"
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <ArrowLeftIcon />
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">
            Table {tableId ?? "-"}
          </Text>
          <View className="w-10 h-10" />
        </View>

        {/* Empty State */}
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🛒</Text>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Panier vide
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Vous n'avez pas encore ajouté d'articles à votre commande.
          </Text>
          <Pressable
            onPress={handleNavigateToMenu}
            className="bg-green-brand px-6 py-3 rounded-full"
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text className="text-white font-semibold">Voir le menu</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable
          onPress={handleGoBack}
          disabled={isSubmitting}
          className="w-10 h-10 items-center justify-center"
          style={({ pressed }) => [pressed && !isSubmitting && styles.pressed]}
        >
          <ArrowLeftIcon />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">
          Table {tableId ?? "-"}
        </Text>
        <Pressable
          onPress={() => {
            // TODO: Show more options menu
          }}
          disabled={isSubmitting}
          className="w-10 h-10 items-center justify-center"
          style={({ pressed }) => [pressed && !isSubmitting && styles.pressed]}
        >
          <MoreIcon />
        </Pressable>
      </View>

      {/* Title */}
      <View className="flex-row items-center px-4 py-4 bg-white">
        <CartIcon />
        <Text className="text-2xl font-bold text-gray-900 ml-3">
          Panier
        </Text>
        <View className="bg-green-brand px-2 py-1 rounded-full ml-2">
          <Text className="text-white text-sm font-bold">{itemCount}</Text>
        </View>
      </View>

      {/* Loading Overlay */}
      {isSubmitting && (
        <View className="absolute inset-0 bg-black/20 z-10 items-center justify-center">
          <View className="bg-white rounded-xl p-6 items-center">
            <ActivityIndicator size="large" color="#1B7A4A" />
            <Text className="mt-3 text-gray-700 font-medium">
              Envoi en cours...
            </Text>
          </View>
        </View>
      )}

      {/* Cart Items */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isSubmitting}
      >
        {items.map((item) => (
          <CartItemCard
            key={item.article_id}
            item={item}
            onUpdateQuantity={(qty) => handleUpdateQuantity(item.article_id, qty)}
            onRemove={() => handleRemoveItem(item.article_id)}
            disabled={isSubmitting}
          />
        ))}

        {/* Add More Items Button */}
        <Pressable
          onPress={handleNavigateToMenu}
          disabled={isSubmitting}
          className={`border-2 border-dashed rounded-xl py-4 items-center justify-center mt-2 ${
            isSubmitting ? "border-gray-200" : "border-gray-300"
          }`}
          style={({ pressed }) => [pressed && !isSubmitting && styles.pressed]}
        >
          <Text className={`font-semibold ${isSubmitting ? "text-gray-300" : "text-gray-500"}`}>
            + Ajouter des articles
          </Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Section */}
      <View className="bg-white px-4 pt-4 pb-6 border-t border-gray-200">
        {/* Error Message */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}

        {/* Grand Total */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg text-gray-600">Total</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {totalPrice.toFixed(2)} MAD
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          {/* Cancel Order Button */}
          <Pressable
            onPress={handleCancelOrder}
            disabled={isSubmitting}
            className={`flex-1 py-4 rounded-full border-2 items-center ${
              isSubmitting ? "border-gray-300" : "border-red-500"
            }`}
            style={({ pressed }) => [pressed && !isSubmitting && styles.pressed]}
          >
            <Text className={`font-bold ${isSubmitting ? "text-gray-300" : "text-red-500"}`}>
              Annuler
            </Text>
          </Pressable>

          {/* Send to Kitchen Button */}
          <Pressable
            onPress={handleSendToKitchen}
            disabled={isSubmitting}
            className={`flex-[2] py-4 rounded-full items-center flex-row justify-center ${
              isSubmitting ? "bg-gray-300" : "bg-green-brand"
            }`}
            style={({ pressed }) => [pressed && !isSubmitting && styles.pressedGreen]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold">Envoyer en cuisine</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
  },
  pressedGreen: {
    opacity: 0.9,
    backgroundColor: "#145C38",
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});
