import React, { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

interface ArticleCardProps {
  id: number;
  nom: string;
  prix: number;
  description?: string;
  image_url: string;
  disponibilite: boolean;
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  showQuantityControls?: boolean;
}

export default function ArticleCard({
  id,
  nom,
  prix,
  description,
  image_url,
  disponibilite,
  quantity = 0,
  onAdd,
  onRemove,
  showQuantityControls = false,
}: ArticleCardProps) {
  const isSoldOut = !disponibilite;
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.card}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: imageError 
              ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop" 
              : image_url 
          }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        
        {/* Sold Out Overlay */}
        {isSoldOut && (
          <View style={styles.soldOutOverlay}>
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>ÉPUISÉ</Text>
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={1}>
          {nom}
        </Text>
        
        <Text style={styles.price}>{prix.toFixed(2).replace(".", ",")} MAD</Text>

        {showQuantityControls && !isSoldOut && (
          <View style={styles.controlsRow}>
            {quantity > 0 ? (
              <>
                <Pressable onPress={onRemove} style={styles.controlBtn}>
                  <Ionicons name="remove" size={18} color="#1B7A4A" />
                </Pressable>
                <View style={styles.quantityValue}>
                  <Text style={styles.quantity}>{quantity}</Text>
                </View>
                <Pressable onPress={onAdd} style={styles.controlBtn}>
                  <Ionicons name="add" size={18} color="#1B7A4A" />
                </Pressable>
              </>
            ) : (
              <Pressable onPress={onAdd} style={styles.addBtn}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldOutBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  soldOutText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  content: {
    padding: 10,
  },
  productName: {
    fontWeight: "600",
    color: "#1A1A1A",
    fontSize: 15,
    marginBottom: 6,
  },
  price: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 15,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1B7A4A",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1B7A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    height: 36,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
});
