import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";

interface ArticleCardProps {
  id: number;
  nom: string;
  prix: number;
  description?: string;
  image_url: string;
  disponibilite: boolean;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function ArticleCard({
  id,
  nom,
  prix,
  description,
  image_url,
  disponibilite,
  quantity,
  onAdd,
  onRemove,
}: ArticleCardProps) {
  const isSoldOut = !disponibilite;

  return (
    <View className="flex-1 m-1.5 bg-white rounded-xl overflow-hidden" style={styles.card}>
      {/* Image Container */}
      <View className="relative aspect-square">
        <Image
          source={{ uri: image_url }}
          className="w-full h-full"
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Sold Out Overlay */}
        {isSoldOut && (
          <View className="absolute inset-0 bg-black/60 items-center justify-center">
            <View className="bg-red-600 px-3 py-1.5 rounded">
              <Text className="text-white font-bold text-sm">SOLD OUT</Text>
            </View>
          </View>
        )}

        {/* Quantity Badge */}
        {quantity > 0 && !isSoldOut && (
          <View className="absolute top-2 right-2 bg-green-brand w-7 h-7 rounded-full items-center justify-center">
            <Text className="text-white font-bold text-sm">{quantity}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Product Name */}
        <Text
          className="font-bold text-gray-900 text-sm leading-tight"
          numberOfLines={2}
        >
          {nom}
        </Text>

        {/* Price */}
        <Text className="text-green-brand font-semibold text-base mt-1">
          {prix.toFixed(2)} MAD
        </Text>

        {/* Quantity Controls */}
        <View className="flex-row items-center justify-between mt-3">
          {/* Minus Button */}
          <Pressable
            onPress={onRemove}
            disabled={isSoldOut || quantity === 0}
            className={`w-9 h-9 rounded-full items-center justify-center ${
              isSoldOut || quantity === 0 ? "bg-gray-200" : "bg-gray-300"
            }`}
            style={({ pressed }) => [
              pressed && !isSoldOut && quantity > 0 && styles.pressed,
            ]}
          >
            <Text
              className={`text-xl font-bold ${
                isSoldOut || quantity === 0 ? "text-gray-400" : "text-gray-700"
              }`}
            >
              −
            </Text>
          </Pressable>

          {/* Quantity Display */}
          <Text className="text-lg font-bold text-gray-900 min-w-[32px] text-center">
            {quantity}
          </Text>

          {/* Plus Button */}
          <Pressable
            onPress={onAdd}
            disabled={isSoldOut}
            className={`w-9 h-9 rounded-full items-center justify-center ${
              isSoldOut ? "bg-gray-300" : "bg-green-brand"
            }`}
            style={({ pressed }) => [
              pressed && !isSoldOut && styles.pressed,
            ]}
          >
            <Text
              className={`text-xl font-bold ${
                isSoldOut ? "text-gray-400" : "text-white"
              }`}
            >
              +
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
