import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { factureService } from '../services/api';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { CommandeItem, ModePaiement } from '../types/commande';

interface PaymentOption {
  key: ModePaiement;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { key: 'especes', label: 'Espèces', icon: 'cash-outline' },
  { key: 'carte_bancaire', label: 'Carte Bancaire', icon: 'card-outline' },
  { key: 'titre_restaurant', label: 'Titre-Resto', icon: 'restaurant-outline' },
];

/**
 * S-F4: Écran Facturation
 *
 * Invoice/payment screen converted from the provided HTML design.
 * - Order summary with items
 * - Subtotal (HT), TVA (10%), Total TTC
 * - Payment method selection
 * - "Imprimer la Facture" button
 */
const FacturationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const commande: CommandeItem = route.params?.commande;

  const [selectedPayment, setSelectedPayment] = useState<ModePaiement>('carte_bancaire');
  const [loading, setLoading] = useState(false);

  // Calculate amounts
  const { montantTTC, montantHT, montantTVA } = useMemo(() => {
    const ttc = commande?.total ?? 0;
    const ht = Math.round((ttc / 1.10) * 100) / 100;
    const tva = Math.round((ttc - ht) * 100) / 100;
    return { montantTTC: ttc, montantHT: ht, montantTVA: tva };
  }, [commande]);

  // Generate invoice number preview
  const invoicePreview = `#INV-${new Date().getFullYear()}-${commande?.id ?? '??'}`;

  const handlePrint = async () => {
    if (!commande) return;

    setLoading(true);
    try {
      const facture = await factureService.create(commande.id, selectedPayment);
      Alert.alert(
        'Facture créée ✓',
        `Facture ${facture.numero_facture}\nTotal: ${facture.montant_ttc.toFixed(2)} €\nPaiement: ${selectedPayment === 'especes' ? 'Espèces' : selectedPayment === 'carte_bancaire' ? 'Carte Bancaire' : 'Titre-Resto'}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Erreur lors de la création de la facture.';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  if (!commande) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorMsg}>Commande introuvable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ConnectionBanner />

      {/* Top App Bar — matching HTML design */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#111c2d" />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Table {commande.table_numero ?? '??'}</Text>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Récapitulatif Commande</Text>
            <Text style={styles.invoiceRef}>{invoicePreview}</Text>
          </View>

          <View style={styles.summaryCard}>
            {/* Order Items */}
            <View style={styles.itemsContainer}>
              {commande.lignes.map((ligne) => (
                <View key={ligne.id} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemQty}>{ligne.quantite}×</Text>
                    <Text style={styles.itemName}>{ligne.article_nom}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{ligne.sous_total.toFixed(2)} €</Text>
                </View>
              ))}
            </View>

            {/* Totals — tonal shift background like HTML design */}
            <View style={styles.totalsCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total (HT)</Text>
                <Text style={styles.totalValue}>{montantHT.toFixed(2)} €</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TVA (10%)</Text>
                <Text style={styles.totalValue}>{montantTVA.toFixed(2)} €</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total (TTC)</Text>
                <Text style={styles.grandTotalValue}>{montantTTC.toFixed(2)} €</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method Selection — matching HTML grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mode de Paiement</Text>

          <View style={styles.paymentGrid}>
            {PAYMENT_OPTIONS.map((option) => {
              const isSelected = selectedPayment === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.paymentCard,
                    isSelected && styles.paymentCardSelected,
                  ]}
                  onPress={() => setSelectedPayment(option.key)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.paymentIcon,
                      isSelected && styles.paymentIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={28}
                      color={isSelected ? '#ffffff' : '#006e2f'}
                    />
                  </View>
                  <Text style={[styles.paymentLabel, isSelected && styles.paymentLabelSelected]}>
                    {option.label}
                  </Text>

                  {/* Selection checkmark */}
                  {isSelected && (
                    <View style={styles.selectionCheck}>
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer — "Imprimer la Facture" button matching HTML */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          onPress={handlePrint}
          disabled={loading}
          activeOpacity={0.9}
          style={styles.printBtnContainer}
        >
          <LinearGradient
            colors={['#006e2f', '#22c55e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.printBtn}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="print-outline" size={22} color="#ffffff" />
                <Text style={styles.printBtnText}>Imprimer la Facture</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FacturationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9f9ff',
  },
  errorMsg: {
    fontSize: 16,
    color: '#93000a',
    fontFamily: 'WorkSans_400Regular',
  },
  backLink: {
    fontSize: 14,
    color: '#006e2f',
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
  },

  // App Bar
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: -0.3,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 24,
  },

  // Sections
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#3f493f',
    opacity: 0.6,
    fontFamily: 'WorkSans_600SemiBold',
  },
  invoiceRef: {
    fontSize: 12,
    color: '#3f493f',
    fontFamily: 'WorkSans_400Regular',
  },

  // Summary card
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  itemsContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemQty: {
    fontWeight: '700',
    color: '#006e2f',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111c2d',
    fontFamily: 'WorkSans_400Regular',
    flex: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'WorkSans_600SemiBold',
  },

  // Totals card (tonal shift)
  totalsCard: {
    backgroundColor: '#f0f3ff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#3f493f',
    fontFamily: 'WorkSans_400Regular',
  },
  totalValue: {
    fontSize: 14,
    color: '#3f493f',
    fontFamily: 'WorkSans_400Regular',
  },
  totalDivider: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: 'rgba(190,202,188,0.3)',
    marginVertical: 4,
  },
  grandTotalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: -1,
  },

  // Payment grid
  paymentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  paymentCardSelected: {
    borderColor: '#006e2f',
    backgroundColor: '#f0fdf4',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#dee8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconSelected: {
    backgroundColor: '#006e2f',
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111c2d',
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
  },
  paymentLabelSelected: {
    color: '#006e2f',
  },
  selectionCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#006e2f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006e2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226,232,240,0.2)',
  },
  printBtnContainer: {
    width: '100%',
  },
  printBtn: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  printBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
