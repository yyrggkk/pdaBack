import React, { useState } from 'react';
import { View, Text, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SoftInput } from '../components/SoftInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuthStore } from '../store/authStore';
import { axiosClient } from '../api/axiosClient';

export const LoginScreen = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { login } = useAuthStore();
  const isCompact = height < 860;

  const handleLogin = async () => {
    if (pin.length !== 4) {
      Alert.alert('Erreur', 'Veuillez saisir un code PIN à 4 chiffres.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axiosClient.post('/login', { pin });

      if (res.data && res.data.token) {
        await login(res.data.user, res.data.token);
      } else {
        Alert.alert('Connexion refusée', 'Réponse invalide du serveur.');
      }
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        Alert.alert('Connexion refusée', 'Délai dépassé. Vérifie que le backend est accessible depuis le téléphone.');
      } else if (!e.response) {
        Alert.alert('Connexion refusée', 'Serveur injoignable. Vérifie l\'IP API et le réseau Wi-Fi.');
      } else {
        Alert.alert('Connexion refusée', e.response?.data?.message || 'Une erreur est survenue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface relative" edges={["top", "bottom"]}>
      
      {/* Decorative Background Elements */}
      <View className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" style={{ opacity: 0.5 }} />
      <View className="absolute -top-12 -right-12 w-48 h-48 bg-primary-container/10 rounded-full blur-2xl pointer-events-none" style={{ opacity: 0.5 }} />

      <View
        className="flex-1 max-w-lg mx-auto w-full"
        style={{
          paddingHorizontal: isCompact ? 20 : 32,
          paddingTop: isCompact ? 8 : 20,
          paddingBottom: Math.max(insets.bottom, 10) + (isCompact ? 8 : 18),
        }}
      >
        {/* Centered Hero Unit: Logo + Greeting */}
        <View className="flex-col items-center text-center" style={{ marginTop: isCompact ? 8 : 24, marginBottom: isCompact ? 10 : 24 }}>
          <View className="flex justify-center" style={{ marginBottom: isCompact ? 8 : 16 }}>
            <Ionicons name="restaurant" size={isCompact ? 64 : 80} color="#047857" />
          </View>
          <Text className={`font-jakarta-bold ${isCompact ? 'text-[2.5rem]' : 'text-[3rem]'} leading-tight tracking-tighter text-on-surface text-center`}>
            Bonjour.
          </Text>
          <Text className={`font-work text-outline mt-2 ${isCompact ? 'text-base' : 'text-lg'} text-center`}>
            Prêt pour le service ?
          </Text>
        </View>

        {/* Centered PIN Interface Area */}
        <View className="flex-1 items-center justify-center">
          <SoftInput pin={pin} setPin={setPin} maxLength={4} compact={isCompact} />
        </View>

        {/* Bottom Actions */}
        <View className="flex items-center justify-end w-full" style={{ paddingTop: isCompact ? 8 : 20 }}>
          <PrimaryButton 
            label="Ouvrir ma session" 
            onPress={handleLogin} 
            loading={isLoading} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
