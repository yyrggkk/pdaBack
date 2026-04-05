import React from 'react';
import { View } from 'react-native';

interface StatusRibbonProps {
  status?: 'occupé' | 'occupee' | 'libre' | 'réservé' | 'reservee' | 'attention' | 'servie' | 'indisponible';
  statut?: 'occupee' | 'libre' | 'servie' | 'indisponible';
}

export const StatusRibbon: React.FC<StatusRibbonProps> = ({ status, statut }) => {
  const finalStatus = statut ?? status ?? 'libre';

  const getStatusColor = () => {
    switch (finalStatus) {
      case 'occupé':
      case 'occupee':
      case 'attention':
        return 'bg-status-occupied';
      case 'servie':
        return 'bg-[#da3437]';
      case 'indisponible':
        return 'bg-gray-300';
      case 'réservé':
      case 'reservee':
        return 'bg-blue-500';
      case 'libre':
        return 'bg-green-500';
      default:
        return 'bg-status-occupied'; // #EF4444 (Rouge)
    }
  };

  return (
    <View className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-xl ${getStatusColor()}`} />
  );
};
