import React, { useRef, useEffect } from "react";
import {
  ScrollView,
  Pressable,
  Text,
  Animated,
  StyleSheet,
  View,
} from "react-native";

interface CategoryTabsProps {
  categories: { id: number; nom: string }[];
  activeId: number;
  onSelect: (id: number) => void;
}

interface TabProps {
  id: number;
  nom: string;
  isActive: boolean;
  onPress: () => void;
}

function Tab({ id, nom, isActive, onPress }: TabProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive, bgAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F3F4F6", "#1B7A4A"],
  });

  const textColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#374151", "#FFFFFF"],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.tab,
          {
            backgroundColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.tabText,
            {
              color: textColor,
            },
          ]}
        >
          {nom}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

export default function CategoryTabs({
  categories,
  activeId,
  onSelect,
}: CategoryTabsProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View className="py-2">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <Tab
            key={category.id}
            id={category.id}
            nom={category.nom}
            isActive={category.id === activeId}
            onPress={() => onSelect(category.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  tabText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
