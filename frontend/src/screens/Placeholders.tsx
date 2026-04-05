import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { axiosClient } from '../api/axiosClient';

const LogoutButton = () => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      console.log("Tentative de déconnexion...");
      // Appeler l'API de déconnexion du backend
      await axiosClient.post('/logout');
    } catch (error) {
      console.log("Erreur lors de la déconnexion côté serveur:", error);
    } finally {
      // Quoi qu'il arrive, on supprime le token localement et met à jour l'état UI
      await logout();
    }
  };

  return (
    <TouchableOpacity 
      onPress={handleLogout} 
      className="absolute top-12 right-6 p-3 bg-red-100 rounded-full flex-row items-center space-x-2"
      activeOpacity={0.7}
      style={{ zIndex: 999, elevation: 10 }}
    >
      <Ionicons name="log-out-outline" size={24} color="#dc2626" />
      <Text className="text-red-600 font-jakarta-bold">Quitter</Text>
    </TouchableOpacity>
  );
};

export const ServeurScreenPlaceholder = ({ title }: { title: string }) => (
  <View className="flex-1 items-center justify-center bg-surface relative">
    <LogoutButton />
    <Text className="text-xl font-jakarta-bold">{title}</Text>
  </View>
);

export const CuisinierScreen = () => (
  <View className="flex-1 items-center justify-center bg-surface relative">
    <LogoutButton />
    <Text className="text-xl font-jakarta-bold">Écran Cuisine (Paysage)</Text>
  </View>
);