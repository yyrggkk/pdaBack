import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '../stores/networkStore';

/**
 * S-F7: "Connexion perdue" banner.
 * Red banner at top of screen when offline. Auto-dismiss when connection restored.
 */
export const ConnectionBanner: React.FC = () => {
  const isOffline = useNetworkStore((s) => s.isOffline);
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents={isOffline ? 'auto' : 'none'}
    >
      <View style={styles.banner}>
        <Ionicons name="cloud-offline-outline" size={18} color="#ffffff" />
        <Text style={styles.text}>Connexion perdue — tentative de reconnexion…</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ba1a1a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingTop: 44,
    gap: 8,
  },
  text: {
    color: '#ffffff',
    fontFamily: 'WorkSans_400Regular',
    fontSize: 13,
    fontWeight: '600',
  },
});
