import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SoftInput } from '../components/SoftInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuthStore } from '../store/authStore';
import { axiosClient } from '../api/axiosClient';

export const LoginScreen = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

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
      }
    } catch (e: any) {
      Alert.alert('Connexion refusée', e.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface relative">
      
      {/* Decorative Background Elements */}
      <View className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" style={{ opacity: 0.5 }} />
      <View className="absolute -top-12 -right-12 w-48 h-48 bg-primary-container/10 rounded-full blur-2xl pointer-events-none" style={{ opacity: 0.5 }} />

      <View className="flex-1 px-8 pt-12 pb-12 max-w-lg mx-auto w-full">
        {/* Centered Hero Unit: Logo + Greeting */}
        <View className="mt-8 mb-[10%] flex-col items-center text-center">
          <View className="mb-6 flex justify-center">
            <Ionicons name="restaurant" size={80} color="#047857" />
          </View>
          <Text className="font-jakarta-bold text-[3rem] leading-tight tracking-tighter text-on-surface text-center">
            Bonjour.
          </Text>
          <Text className="font-work text-outline mt-2 text-lg text-center">
            Prêt pour le service ?
          </Text>
        </View>

        {/* Centered PIN Interface Area */}
        <View className="flex-grow items-center justify-center">
          <SoftInput pin={pin} setPin={setPin} maxLength={4} />
        </View>

        {/* Bottom Actions */}
        <View className="mt-auto pt-8 flex items-center justify-end w-full">
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
