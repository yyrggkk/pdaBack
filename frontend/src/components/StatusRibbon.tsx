import React from 'react';
import { View } from 'react-native';

interface StatusRibbonProps {
  status: 'occupé' | 'libre' | 'réservé' | 'attention';
}

export const StatusRibbon: React.FC<StatusRibbonProps> = ({ status }) => {
  // Détermine la couleur de la barre en fonction du statut
  const getStatusColor = () => {
    switch (status) {
      case 'occupé':
        return 'bg-status-occupied'; // #EF4444 (Rouge)
      case 'libre':
        return 'bg-green-500';
      case 'réservé':
        return 'bg-blue-500';
      case 'attention':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <View className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-xl ${getStatusColor()}`} />
  );
};