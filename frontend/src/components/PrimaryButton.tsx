import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, isLoading, ...props }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isLoading}
      className={`w-full ${isLoading ? 'opacity-70' : ''}`}
      {...props}
    >
      <LinearGradient
        colors={['#006e2f', '#22c55e']} // Verts basés sur ton mockup
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-10 py-5 rounded-xl shadow-lg items-center justify-center"
      >
        <Text className="text-white font-jakarta-bold text-lg">
          {isLoading ? 'Chargement...' : title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};