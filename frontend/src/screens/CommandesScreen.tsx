import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCommandeStore } from '../stores/commandeStore';
import { usePolling } from '../hooks/usePolling';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { CommandeItem, CommandeStatus, STATUS_LABELS } from '../types/commande';

type FilterTab = 'toutes' | 'en_cuisine' | 'prete' | 'servie';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'en_cuisine', label: 'En cuisine' },
  { key: 'prete', label: 'Prêtes' },
  { key: 'servie', label: 'Servies' },
];

/**
 * S-F3: Écran Commandes Serveur
 *
 * List active orders with filters, status badges, and actions.
 * - Filters: All / In Progress / Ready / Served
 * - Highlight "Ready" orders
 * - Actions: "Mark Served", "Collect Payment"
 */
const CommandesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { commandes, loading, error, fetchCommandes, updateOrderStatus } = useCommandeStore();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('toutes');
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch all active orders
  const loadOrders = useCallback(() => {
    fetchCommandes('en_cuisine,en_preparation,prete,servie');
  }, [fetchCommandes]);

  // S-F6: Polling every 10s
  usePolling(loadOrders, 10000, true);

  // Filter commandes
  const filteredCommandes = commandes.filter((c) => {
    if (activeFilter === 'toutes') return true;
    if (activeFilter === 'en_cuisine') return c.statut === 'en_cuisine' || c.statut === 'en_preparation';
    return c.statut === activeFilter;
  });

  // Mark order as served
  const handleMarkServed = async (id: number) => {
    try {
      setUpdatingId(id);
      await updateOrderStatus(id, 'servie');
      loadOrders();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de mettre à jour le statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Navigate to Facturation (payment)
  const handleCollectPayment = (commande: CommandeItem) => {
    navigation.navigate('Facturation', { commande });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCommandes('en_cuisine,en_preparation,prete,servie');
    setRefreshing(false);
  }, [fetchCommandes]);

  // Status badge colors
  const getStatusStyle = (statut: CommandeStatus) => {
    switch (statut) {
      case 'prete':
        return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'en_cuisine':
      case 'en_preparation':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'servie':
        return { bg: '#e7eeff', text: '#111c2d', border: '#d8e3fb' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
    }
  };

  // Calculate elapsed time string
  const getElapsedTime = (dateStr: string) => {
    const created = new Date(dateStr).getTime();
    const now = Date.now();
    const mins = Math.floor((now - created) / 60000);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h${String(mins % 60).padStart(2, '0')}`;
  };

  const renderOrderCard = ({ item }: { item: CommandeItem }) => {
    const statusStyle = getStatusStyle(item.statut);
    const isPrete = item.statut === 'prete';
    const isServie = item.statut === 'servie';
    const itemCount = item.lignes.reduce((acc, l) => acc + l.quantite, 0);

    return (
      <View style={[styles.orderCard, isPrete && styles.orderCardHighlight]}>
        {/* Left accent for ready orders */}
        {isPrete && <View style={styles.readyAccent} />}

        <View style={styles.orderContent}>
          {/* Top row: table + status */}
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text style={styles.orderTableNumber}>Table {item.table_numero ?? '??'}</Text>
              <Text style={styles.orderTime}>
                <Ionicons name="time-outline" size={12} color="#6f7a6e" />{' '}
                {getElapsedTime(item.date_commande)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {STATUS_LABELS[item.statut] || item.statut}
              </Text>
            </View>
          </View>

          {/* Items summary */}
          <View style={styles.orderItems}>
            {item.lignes.slice(0, 3).map((ligne) => (
              <Text key={ligne.id} style={styles.orderItemText} numberOfLines={1}>
                {ligne.quantite}× {ligne.article_nom}
              </Text>
            ))}
            {item.lignes.length > 3 && (
              <Text style={styles.orderMoreItems}>
                +{item.lignes.length - 3} autre{item.lignes.length - 3 > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* Bottom row: total + actions */}
          <View style={styles.orderFooter}>
            <View style={styles.orderMeta}>
              <Text style={styles.orderTotal}>{item.total.toFixed(2)} €</Text>
              <Text style={styles.orderItemCount}>{itemCount} article{itemCount > 1 ? 's' : ''}</Text>
            </View>

            <View style={styles.orderActions}>
              {isPrete && (
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => handleMarkServed(item.id)}
                  disabled={updatingId === item.id}
                  activeOpacity={0.8}
                >
                  {updatingId === item.id ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff" />
                      <Text style={styles.actionBtnPrimaryText}>Servie</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              {isServie && (
                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => handleCollectPayment(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="card-outline" size={16} color="#006e2f" />
                  <Text style={styles.actionBtnSecondaryText}>Encaisser</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ConnectionBanner />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commandes</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{commandes.length}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count =
            tab.key === 'toutes'
              ? commandes.length
              : tab.key === 'en_cuisine'
              ? commandes.filter((c) => c.statut === 'en_cuisine' || c.statut === 'en_preparation').length
              : commandes.filter((c) => c.statut === tab.key).length;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                  <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#93000a" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Orders List */}
      {loading && commandes.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#006e2f" />
          <Text style={styles.loadingText}>Chargement…</Text>
        </View>
      ) : filteredCommandes.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="receipt-outline" size={48} color="#becabc" />
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'toutes'
              ? 'Aucune commande active pour le moment'
              : `Aucune commande "${FILTER_TABS.find((t) => t.key === activeFilter)?.label}"`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCommandes}
          renderItem={renderOrderCard}
          keyExtractor={(item) => `order-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006e2f" />
          }
        />
      )}
    </View>
  );
};

export default CommandesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6f7a6e',
    fontFamily: 'WorkSans_400Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e7eeff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  headerBadge: {
    backgroundColor: '#006e2f',
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e7eeff',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#f0f3ff',
  },
  filterTabActive: {
    backgroundColor: '#006e2f',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3f493f',
    fontFamily: 'WorkSans_600SemiBold',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d8e3fb',
    paddingHorizontal: 4,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  filterBadgeTextActive: {
    color: '#ffffff',
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCardHighlight: {
    borderWidth: 2,
    borderColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOpacity: 0.15,
  },
  readyAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#22c55e',
  },
  orderContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    gap: 2,
  },
  orderTableNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  orderTime: {
    fontSize: 12,
    color: '#6f7a6e',
    fontFamily: 'WorkSans_400Regular',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderItems: {
    marginBottom: 12,
    gap: 2,
  },
  orderItemText: {
    fontSize: 14,
    color: '#3f493f',
    fontFamily: 'WorkSans_400Regular',
  },
  orderMoreItems: {
    fontSize: 13,
    color: '#6f7a6e',
    fontStyle: 'italic',
    fontFamily: 'WorkSans_400Regular',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f3ff',
    paddingTop: 12,
  },
  orderMeta: {
    gap: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  orderItemCount: {
    fontSize: 12,
    color: '#6f7a6e',
    fontFamily: 'WorkSans_400Regular',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#006e2f',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#006e2f',
  },
  actionBtnSecondaryText: {
    color: '#006e2f',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6f7a6e',
    fontFamily: 'WorkSans_400Regular',
    textAlign: 'center',
  },
});
