import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CommandeItem } from '../types/commande';

interface KitchenTicketProps {
  commande: CommandeItem;
  onMarkReady: (id: number) => void;
  loading?: boolean;
}

/**
 * S-F1: KitchenTicket Component
 *
 * Ticket-style order card matching the provided HTML design.
 * - Header: Table number, time, elapsed time
 * - Body: List of articles with quantities
 * - Footer: "PRÊT" button
 * - Color coding based on age (green → orange → red)
 */
export const KitchenTicket: React.FC<KitchenTicketProps> = ({
  commande,
  onMarkReady,
  loading = false,
}) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Calculate elapsed time
  useEffect(() => {
    const update = () => {
      const created = new Date(commande.date_commande).getTime();
      const now = Date.now();
      const diffMs = now - created;
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };
    update();
    const interval = setInterval(update, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [commande.date_commande]);

  // Color coding based on age
  const getUrgencyConfig = () => {
    if (elapsedMinutes >= 15) {
      return {
        ribbonColor: '#b61622', // secondary (red)
        label: 'URGENT',
        labelColor: '#b61622',
        timerBg: 'rgba(255, 218, 214, 0.5)', // error-container
        timerText: '#b61622',
        timerBorder: undefined as string | undefined,
      };
    } else if (elapsedMinutes >= 5) {
      return {
        ribbonColor: '#f59e0b', // amber-500
        label: 'EN COURS',
        labelColor: '#d97706', // amber-600
        timerBg: '#fffbeb', // amber-50
        timerText: '#b45309', // amber-700
        timerBorder: '#fef3c7', // amber-100
      };
    } else {
      return {
        ribbonColor: '#006e2f', // primary-container
        label: 'NOUVEAU',
        labelColor: '#006e2f',
        timerBg: 'rgba(154, 247, 168, 0.3)', // primary-fixed light
        timerText: '#005322',
        timerBorder: undefined as string | undefined,
      };
    }
  };

  const urgency = getUrgencyConfig();

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes % 1) * 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatElapsed = () => {
    const hrs = Math.floor(elapsedMinutes / 60);
    const mins = elapsedMinutes % 60;
    if (hrs > 0) return `${hrs}h${String(mins).padStart(2, '0')}`;
    return `${String(mins).padStart(2, '0')}:00`;
  };

  const toggleItem = (lineId: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Status Ribbon */}
      <View style={[styles.ribbon, { backgroundColor: urgency.ribbonColor }]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.urgencyLabel, { color: urgency.labelColor }]}>
              {urgency.label}
            </Text>
            <Text style={styles.tableNumber}>
              Table {commande.table_numero ?? '??'}
            </Text>
          </View>
          <View
            style={[
              styles.timerBadge,
              {
                backgroundColor: urgency.timerBg,
                borderColor: urgency.timerBorder || 'transparent',
                borderWidth: urgency.timerBorder ? 1 : 0,
              },
            ]}
          >
            <Ionicons name="timer-outline" size={16} color={urgency.timerText} />
            <Text style={[styles.timerText, { color: urgency.timerText }]}>
              {formatElapsed()}
            </Text>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.itemsList}>
          {commande.lignes.map((ligne) => {
            const isChecked = checkedItems.has(ligne.id);
            return (
              <TouchableOpacity
                key={ligne.id}
                style={styles.itemRow}
                onPress={() => toggleItem(ligne.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && {
                      backgroundColor: urgency.ribbonColor,
                      borderColor: urgency.ribbonColor,
                    },
                  ]}
                >
                  {isChecked && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.itemText,
                    isChecked && styles.itemTextChecked,
                  ]}
                >
                  {ligne.quantite}x {ligne.article_nom}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Button — PRÊT */}
        <TouchableOpacity
          onPress={() => {
            handlePress();
            onMarkReady(commande.id);
          }}
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#006e2f', '#22c55e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.readyButton}
          >
            <Ionicons name="restaurant-outline" size={22} color="#ffffff" />
            <Text style={styles.readyButtonText}>PRÊT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', // surface-container-lowest
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  ribbon: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  urgencyLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tableNumber: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 40,
    fontWeight: '700',
    color: '#111c2d', // on-surface
    letterSpacing: -2,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  timerText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    fontWeight: '700',
  },
  itemsList: {
    gap: 12,
    marginBottom: 28,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#f0f3ff', // surface-container-low
    borderRadius: 12,
    padding: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d8e3fb', // surface-container-highest
    backgroundColor: '#d8e3fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#111c2d',
    flex: 1,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.4,
    color: '#3f493f', // on-surface-variant
  },
  readyButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#006e2f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  readyButtonText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 3,
  },
});
