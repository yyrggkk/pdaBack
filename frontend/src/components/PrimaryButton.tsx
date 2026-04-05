import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.buttonContainer,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabledOpacity,
      ]}
    >
      {isDisabled ? (
        <View style={styles.disabledBackground}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {icon && <View style={styles.iconWrapper}>{icon}</View>}
              <Text style={styles.label}>{label}</Text>
            </>
          )}
        </View>
      ) : (
        <LinearGradient
          colors={["#1B7A4A", "#145C38"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    borderRadius: 9999,
    shadowColor: "#1B7A4A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradient: {
    height: 56,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabledBackground: {
    backgroundColor: "#9E9E9E",
    height: 56,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  disabledOpacity: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  iconWrapper: {
    marginRight: 8,
  },
  label: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
