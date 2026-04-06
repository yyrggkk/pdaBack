import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

type BottomNavTab = "plan" | "menu" | "commandes";

type BottomNavBarProps = {
  activeTab: BottomNavTab;
  onTabChange?: (tab: BottomNavTab) => void;
};

export default function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const uiScale = Math.max(0.72, Math.min(width / 430, 1));

  const activeHeight = Math.max(80, Math.round(102 * uiScale));
  const inactiveHeight = Math.max(80, Math.round(98 * uiScale));
  const iconSize = Math.round(28 * uiScale);
  const labelSize = Math.round(14 * uiScale);

  const goPlan = () => {
    if (onTabChange) {
      onTabChange("plan");
      return;
    }

    if (activeTab !== "plan") {
      router.replace("./serveur");
    }
  };

  const goMenu = () => {
    if (onTabChange) {
      onTabChange("menu");
      return;
    }

    if (activeTab !== "menu") {
      router.replace("./menu");
    }
  };

  const goCommandes = () => {
    if (onTabChange) {
      onTabChange("commandes");
      return;
    }

    if (activeTab !== "commandes") {
      router.replace("./commandes");
    }
  };

  return (
    <View style={styles.bottomNav}>
      {activeTab === "plan" ? (
        <View style={styles.activeTab}>
          <LinearGradient
            colors={["#00883d", "#1fc85f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.activeTabFill, { height: activeHeight }]}
          >
            <MaterialCommunityIcons name="table-furniture" size={iconSize} color="#ffffff" />
            <Text style={[styles.activeTabText, { fontSize: labelSize }]}>PLAN</Text>
          </LinearGradient>
        </View>
      ) : (
        <Pressable
          onPress={goPlan}
          style={({ pressed }) => [styles.inactiveTab, { height: inactiveHeight }, pressed && styles.scaleDown]}
        >
          <MaterialCommunityIcons name="table-furniture" size={iconSize} color="#767d8b" />
          <Text style={[styles.inactiveTabText, { fontSize: labelSize }]}>PLAN</Text>
        </Pressable>
      )}

      {activeTab === "menu" ? (
        <View style={styles.activeTab}>
          <LinearGradient
            colors={["#00883d", "#1fc85f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.activeTabFill, { height: activeHeight }]}
          >
            <MaterialCommunityIcons name="silverware-variant" size={iconSize} color="#ffffff" />
            <Text style={[styles.activeTabText, { fontSize: labelSize }]}>MENU</Text>
          </LinearGradient>
        </View>
      ) : (
        <Pressable
          onPress={goMenu}
          style={({ pressed }) => [styles.inactiveTab, { height: inactiveHeight }, pressed && styles.scaleDown]}
        >
          <MaterialCommunityIcons name="silverware-variant" size={iconSize} color="#767d8b" />
          <Text style={[styles.inactiveTabText, { fontSize: labelSize }]}>MENU</Text>
        </Pressable>
      )}

      {activeTab === "commandes" ? (
        <View style={styles.activeTab}>
          <LinearGradient
            colors={["#00883d", "#1fc85f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.activeTabFill, { height: activeHeight }]}
          >
            <View style={styles.activeCommandesIconWrap}>
              <MaterialCommunityIcons name="note-text-outline" size={iconSize} color="#ffffff" />
              <View style={styles.activeCommandesDot} />
            </View>
            <Text style={[styles.activeTabText, { fontSize: labelSize }]}>COMMANDES</Text>
          </LinearGradient>
        </View>
      ) : (
        <Pressable
          onPress={goCommandes}
          style={({ pressed }) => [styles.inactiveTab, { height: inactiveHeight }, pressed && styles.scaleDown]}
        >
          <MaterialCommunityIcons name="note-text-outline" size={iconSize} color="#767d8b" />
          <Text style={[styles.inactiveTabText, { fontSize: labelSize }]}>COMMANDES</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: "#f4f5fa",
    borderTopWidth: 1,
    borderTopColor: "#e3e8f3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeTab: {
    flex: 1,
    maxWidth: 172,
    borderRadius: 54,
  },
  activeTabFill: {
    borderRadius: 54,
    height: 102,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  activeTabText: {
    color: "#ffffff",
    fontFamily: "WorkSans_600SemiBold",
    fontSize: 14,
    letterSpacing: 1.2,
  },
  activeCommandesIconWrap: {
    position: "relative",
  },
  activeCommandesDot: {
    position: "absolute",
    right: -1,
    top: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  inactiveTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 98,
    borderRadius: 44,
  },
  inactiveTabText: {
    color: "#767d8b",
    fontFamily: "WorkSans_500Medium",
    fontSize: 14,
    letterSpacing: 1,
  },
  scaleDown: {
    transform: [{ scale: 0.96 }],
  },
});
