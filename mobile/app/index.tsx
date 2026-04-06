import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  PlusJakartaSans_800ExtraBold,
  useFonts as useJakartaFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  useFonts as useWorkSansFonts,
} from "@expo-google-fonts/work-sans";
import { useState } from "react";
import { loginWithPin } from "../services/posApi";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"];

export default function Index() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { width, height } = useWindowDimensions();
  const [jakartaLoaded] = useJakartaFonts({ PlusJakartaSans_800ExtraBold });
  const [workSansLoaded] = useWorkSansFonts({
    WorkSans_500Medium,
    WorkSans_600SemiBold,
  });

  const uiScale = Math.max(0.72, Math.min(width / 430, 1));
  const verticalScale = Math.max(0.82, Math.min(height / 900, 1));
  const titleSize = Math.round(54 * uiScale);
  const subtitleSize = Math.round(20 * uiScale);
  const pinHeight = Math.round(86 * uiScale);
  const keyFontSize = Math.round(34 * uiScale);
  const backspaceSize = Math.round(22 * uiScale);
  const ctaHeight = Math.round(78 * uiScale);
  const contentTopMargin = Math.max(14, Math.round(34 * verticalScale));

  if (!jakartaLoaded || !workSansLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  const onPressKey = (key: string) => {
    if (!key) return;

    if (key === "backspace") {
      setPin((prev) => prev.slice(0, -1));
      return;
    }

    setPin((prev) => (prev.length < 4 ? `${prev}${key}` : prev));
  };

  const onOpenSession = async () => {
    if (pin.length !== 4 || isLoggingIn) {
      return;
    }

    try {
      setIsLoggingIn(true);
      const auth = await loginWithPin(pin);

      if (auth.user.role === "cuisinier") {
        router.replace("./cuisinier");
        return;
      }

      router.replace("./pos");
    } catch {
      // Keep UX simple for PDA mode; invalid PIN keeps user on keypad.
      setPin("");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <View style={styles.verticalDivider} />

      <View style={[styles.content, { marginTop: contentTopMargin }]}>
        <View style={styles.heroBlock}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={76} color="#007f57" />

          <Text
            style={[
              styles.title,
              {
                fontSize: titleSize,
                lineHeight: Math.round(titleSize * 1.1),
                letterSpacing: -1.2 * uiScale,
              },
            ]}
          >
            Bonjour.
          </Text>
          <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>Pret pour le service ?</Text>
        </View>

        <View style={[styles.pinField, { height: pinHeight, marginBottom: 30 * verticalScale }]}>
          {Array.from({ length: 4 }, (_, index) => (
            <View key={`slot-${index}`} style={styles.pinSlot}>
              <Text
                style={[
                  styles.pinDigit,
                  {
                    fontSize: Math.round(30 * uiScale),
                    lineHeight: Math.round(34 * uiScale),
                  },
                ]}
              >
                {pin[index] ?? ""}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.keypad}>
          {KEYS.map((key, index) => {
            if (!key) {
              return <View key={`spacer-${index}`} style={styles.keySpacer} />;
            }

            const isBackspace = key === "backspace";

            return (
              <Pressable
                key={key}
                onPress={() => onPressKey(key)}
                style={({ pressed }) => [
                  styles.key,
                  isBackspace && styles.backspaceKey,
                  pressed && styles.keyPressed,
                ]}
              >
                {isBackspace ? (
                  <View style={styles.keyLabelWrap}>
                    <MaterialCommunityIcons
                      name="backspace-outline"
                      size={backspaceSize}
                      color="#67717f"
                      style={styles.backspaceIcon}
                    />
                  </View>
                ) : (
                  <View style={styles.keyLabelWrap}>
                    <Text
                      style={[
                        styles.keyText,
                        {
                          fontSize: keyFontSize,
                          lineHeight: keyFontSize,
                        },
                      ]}
                    >
                      {key}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={onOpenSession}
          style={({ pressed }) => [
            styles.ctaWrapper,
            (pin.length !== 4 || isLoggingIn) && styles.ctaDisabled,
            pressed && styles.ctaPressed,
          ]}
        >
          <LinearGradient
            colors={["#00883d", "#1fc85f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cta, { height: ctaHeight }]}
          >
            <Text
              style={[
                styles.ctaText,
                {
                  fontSize: Math.round(28 * uiScale),
                  lineHeight: Math.round(33 * uiScale),
                },
              ]}
            >
              {isLoggingIn ? "Connexion..." : "Ouvrir ma session"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e7e8ef",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#e7e8ef",
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -120,
    right: -90,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#f5f8f7",
    opacity: 0.8,
  },
  backgroundGlowBottom: {
    position: "absolute",
    bottom: 140,
    left: -90,
    width: 390,
    height: 260,
    borderRadius: 140,
    backgroundColor: "#eceef6",
    opacity: 0.95,
  },
  verticalDivider: {
    position: "absolute",
    top: 170,
    bottom: 0,
    left: "63%",
    width: 1,
    backgroundColor: "#cfd3de",
    opacity: 0.35,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 18,
  },
  heroBlock: {
    alignItems: "center",
    marginBottom: 26,
  },
  title: {
    marginTop: 14,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#071634",
  },
  subtitle: {
    marginTop: 2,
    fontFamily: "WorkSans_500Medium",
    color: "#6e776e",
  },
  pinField: {
    height: 86,
    borderRadius: 50,
    backgroundColor: "#dde0ed",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 42,
    marginBottom: 30,
  },
  pinSlot: {
    width: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDigit: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0f1f3a",
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    columnGap: 12,
  },
  key: {
    width: "30.8%",
    aspectRatio: 1.15,
    borderRadius: 34,
    backgroundColor: "#fdfefe",
    justifyContent: "center",
    alignItems: "center",
  },
  keySpacer: {
    width: "30.8%",
  },
  backspaceKey: {
    backgroundColor: "#dce0ee",
  },
  keyPressed: {
    transform: [{ scale: 0.96 }],
  },
  keyText: {
    fontFamily: "WorkSans_600SemiBold",
    color: "#091a37",
    fontSize: 34,
    lineHeight: 34,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  keyLabelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  backspaceIcon: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  bottomBar: {
    backgroundColor: "rgba(243, 245, 250, 0.9)",
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 14,
  },
  ctaWrapper: {
    borderRadius: 40,
    shadowColor: "#0f2f2d",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 7,
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaDisabled: {
    opacity: 0.58,
  },
  cta: {
    height: 78,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaText: {
    color: "#ffffff",
    fontFamily: "WorkSans_600SemiBold",
    fontSize: 28,
    lineHeight: 33,
  },
});
