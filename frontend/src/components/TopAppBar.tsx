import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

interface TopAppBarProps {
  title?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title = 'Station 01' }) => {
  const { user, logout } = useAuthStore();

  return (
    <BlurView intensity={70} tint="light" className="w-full absolute top-0 z-50 pt-12 pb-4 px-6 flex-row justify-between items-center border-b border-gray-200/50">
      <View className="flex-row items-center">
        <Ionicons name="restaurant" size={24} color="#006e2f" />
        <Text className="text-xl font-jakarta-bold text-on-surface ml-2">{title}</Text>
      </View>

      {user && (
        <View className="flex-row items-center">
          <Text className="text-sm font-work mr-4 font-semibold">
            {user.nom} ({user.role})
          </Text>
          <TouchableOpacity onPress={logout} activeOpacity={0.7} className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    </BlurView>
  );
};
