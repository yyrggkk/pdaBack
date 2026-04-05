import "./global.css";
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { WorkSans_400Regular, WorkSans_600SemiBold } from '@expo-google-fonts/work-sans';
import { useAuthStore } from './src/store/authStore';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const { checkToken, isAuthenticated } = useAuthStore();

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_700Bold,
    WorkSans_400Regular,
    WorkSans_600SemiBold,
  });

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 flex-col items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#005322" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <AppNavigator />
      <StatusBar style="auto" />
    </View>
  );
}
