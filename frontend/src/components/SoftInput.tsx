import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface SoftInputProps {
  pin: string;
  setPin: (pin: string) => void;
  maxLength?: number;
}

export const SoftInput: React.FC<SoftInputProps> = ({ pin, setPin, maxLength = 4 }) => {

  const handleKeyPress = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (pin.length < maxLength) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  // Tableau du pavé numérique
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  return (
    <View className="w-full">
      {/* Affichage du PIN, calqué sur l'input du HTML */}
      <View className="bg-surface-container-low w-full h-24 mb-12 rounded-xl justify-center items-center">
        <Text className="text-4xl font-jakarta-bold tracking-[1.5rem] text-on-surface">
          {pin.padEnd(maxLength, '•')}
        </Text>
      </View>

      {/* Grille du pavé numérique */}
      <View className="flex-row flex-wrap justify-between w-full">
        {keys.map((key, index) => {
          if (key === '') {
            return <View key={`empty-${index}`} className="w-[30%] h-20 mb-4" />;
          }

          if (key === 'delete') {
            return (
              <TouchableOpacity
                key="delete"
                activeOpacity={0.7}
                onPress={handleDelete}
                className="w-[30%] h-20 mb-4 rounded-xl items-center justify-center bg-surface-container-low"
              >
                <Ionicons name="backspace" size={24} color="#111c2d" style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              onPress={() => handleKeyPress(key)}
              className="w-[30%] h-20 mb-4 rounded-xl items-center justify-center bg-surface-container-lowest"
            >
              <Text className="text-3xl font-jakarta-bold text-on-surface">{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
