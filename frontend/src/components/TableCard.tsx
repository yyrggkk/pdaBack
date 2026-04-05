import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { TABLE_STATUS_COLORS } from "../theme/tableTheme";
import { TableSummary } from "../types/table";

interface TableCardProps {
  table: TableSummary;
  onPress: (table: TableSummary) => void;
}

export function TableCard({ table, onPress }: TableCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const borderColor = TABLE_STATUS_COLORS[table.statut];
  const faded = table.statut === "indisponible";

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 38,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(table)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={faded}
      className="w-[31%] items-center"
    >
      <Animated.View style={{ transform: [{ scale }], opacity: faded ? 0.4 : 1 }}>
        <View className="h-[78px] w-[96px] items-center justify-center">
          <View
            style={{ borderColor }}
            className="h-[50px] w-[78px] items-center justify-center rounded-md border-[2.5px] bg-white"
          >
            <Text className="text-[30px] font-black tracking-tight text-[#111c2d]">
              {String(table.numero).padStart(2, "0")}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
