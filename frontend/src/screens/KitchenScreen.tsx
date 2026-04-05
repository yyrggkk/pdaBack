import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useCommandeStore } from '../stores/commandeStore';
import { usePolling } from '../hooks/usePolling';
import { KitchenTicket } from '../components/KitchenTicket';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { CommandeItem } from '../types/commande';
import * as ScreenOrientation from 'expo-screen-orientation';

/**
 * S-F2: Écran Cuisine (KDS)
 *
 * Kitchen display system screen:
 * - Grid of KitchenTickets
 * - Two columns: "En cuisine" & "En préparation"
 * - Auto-refresh via polling (10s)
 * - Logout button
 */
const KitchenScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { commandes, loading, error, fetchCommandes, updateOrderStatus } = useCommandeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch kitchen orders (en_cuisine + en_preparation)
  const loadOrders = useCallback(() => {
    fetchCommandes('en_cuisine,en_preparation');
  }, [fetchCommandes]);

  // S-F6: Polling every 10s
  usePolling(loadOrders, 10000, true);

  // Lock to landscape on mount, revert to portrait on unmount
  useEffect(() => {
    async function lockLandscape() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    lockLandscape();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // Separate orders by status
  const enCuisineOrders = commandes.filter((c) => c.statut === 'en_cuisine');
  const enPreparationOrders = commandes.filter((c) => c.statut === 'en_preparation');

  // Mark order as ready (PRÊT)
  const handleMarkReady = async (id: number) => {
    try {
      setUpdatingId(id);
      const order = commandes.find((c) => c.id === id);
      if (!order) return;

      if (order.statut === 'en_cuisine') {
        await updateOrderStatus(id, 'en_preparation');
      } else if (order.statut === 'en_preparation') {
        await updateOrderStatus(id, 'prete');
      }
      // Refresh after status change
      loadOrders();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de mettre à jour le statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCommandes('en_cuisine,en_preparation');
    setRefreshing(false);
  }, [fetchCommandes]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.log('Logout error:', e);
    }
  };

  const renderTicket = ({ item }: { item: CommandeItem }) => (
    <View style={styles.ticketWrapper}>
      <KitchenTicket
        commande={item}
        onMarkReady={handleMarkReady}
        loading={updatingId === item.id}
      />
    </View>
  );

  const renderColumn = (
    title: string,
    orders: CommandeItem[],
    iconName: keyof typeof Ionicons.glyphMap,
    accentColor: string
  ) => (
    <View style={styles.column}>
      {/* Column Header */}
      <View style={[styles.columnHeader, { borderBottomColor: accentColor }]}>
        <Ionicons name={iconName} size={20} color={accentColor} />
        <Text style={[styles.columnTitle, { color: accentColor }]}>{title}</Text>
        <View style={[styles.countBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.countBadgeText}>{orders.length}</Text>
        </View>
      </View>

      {/* Orders List */}
      {orders.length === 0 ? (
        <View style={styles.emptyColumn}>
          <Ionicons name="checkmark-circle-outline" size={36} color="#becabc" />
          <Text style={styles.emptyText}>Aucune commande</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderTicket}
          keyExtractor={(item) => `ticket-${item.id}`}
          contentContainerStyle={styles.ticketList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006e2f" />
          }
        />
      )}
    </View>
  );

  if (loading && commandes.length === 0) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#006e2f" />
        <Text style={styles.loadingText}>Chargement des commandes…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9ff" />
      <ConnectionBanner />

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <Ionicons name="restaurant" size={26} color="#006e2f" />
          <Text style={styles.appBarTitle}>Cuisine</Text>
        </View>

        <View style={styles.appBarRight}>
          {user && (
            <Text style={styles.userName}>{user.nom}</Text>
          )}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#93000a" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Two-column KDS layout */}
      <View style={styles.columnsContainer}>
        {renderColumn('En Cuisine', enCuisineOrders, 'flame-outline', '#b61622')}
        <View style={styles.columnDivider} />
        {renderColumn('En Préparation', enPreparationOrders, 'time-outline', '#d97706')}
      </View>
    </View>
  );
};

export default KitchenScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff', // surface
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9ff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6f7a6e',
    fontFamily: 'WorkSans_400Regular',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e7eeff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3f493f',
    fontFamily: 'WorkSans_600SemiBold',
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffdad6',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#93000a',
    fontSize: 13,
    fontFamily: 'WorkSans_400Regular',
  },
  columnsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    backgroundColor: '#ffffff',
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.5,
    flex: 1,
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  columnDivider: {
    width: 1,
    backgroundColor: '#e7eeff',
  },
  emptyColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 60,
  },
  emptyText: {
    color: '#6f7a6e',
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
  },
  ticketList: {
    padding: 12,
  },
  ticketWrapper: {
    marginBottom: 4,
  },
});
