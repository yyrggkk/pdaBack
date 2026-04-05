import React from "react";
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  View,
} from "react-native";

interface CategoryTabsProps {
  categories: { id: number; nom: string }[];
  activeId: number;
  onSelect: (id: number) => void;
}

export default function CategoryTabs({
  categories,
  activeId,
  onSelect,
}: CategoryTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <Pressable
              key={category.id}
              onPress={() => onSelect(category.id)}
              style={[
                styles.tab,
                isActive && styles.activeTab,
              ]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {category.nom}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tab: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#2E7D32",
  },
  tabText: {
    fontWeight: "600",
    fontSize: 13,
    color: "#2E7D32",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
