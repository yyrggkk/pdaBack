import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts as useJakartaFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
  useFonts as useWorkSansFonts,
} from "@expo-google-fonts/work-sans";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { fetchCommandes } from "../../../services/posApi";

type PaymentMethod = "cash" | "card";

type InvoiceLine = {
  id: string;
  quantity: number;
  title: string;
  amount: number;
};

type InvoiceAccumulator = {
  quantity: number;
  amount: number;
};

export default function TableFactureScreen() {
  const router = useRouter();
  const { tableId } = useLocalSearchParams<{ tableId?: string }>();
  const { width, height } = useWindowDimensions();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);
  const [invoiceRef, setInvoiceRef] = useState("#INV-00000");
  const [totalTtc, setTotalTtc] = useState(0);

  const [jakartaLoaded] = useJakartaFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [workSansLoaded] = useWorkSansFonts({
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  const uiScale = Math.max(0.72, Math.min(width / 430, 1));
  const verticalScale = Math.max(0.82, Math.min(height / 900, 1));

  useEffect(() => {
    const loadFactureData = async () => {
      try {
        const tableNumero = Number(tableId);
        if (Number.isNaN(tableNumero)) {
          setInvoiceLines([]);
          setInvoiceRef("#INV-00000");
          setTotalTtc(0);
          return;
        }

        const commandes = await fetchCommandes();
        const tableCommandes = commandes
          .filter((commande) => commande.table_numero === tableNumero)
          .sort((a, b) => (new Date(b.date_commande ?? 0).getTime() - new Date(a.date_commande ?? 0).getTime()));

        const factureCommandes = tableCommandes.filter((commande) => commande.statut !== "annule");

        if (factureCommandes.length === 0) {
          setInvoiceLines([]);
          setInvoiceRef("#INV-00000");
          setTotalTtc(0);
          return;
        }

        const linesByArticle = factureCommandes.reduce<Record<string, InvoiceAccumulator>>((acc, commande) => {
          for (const ligne of commande.lignes) {
            const key = ligne.article_nom;
            const current = acc[key] ?? { quantity: 0, amount: 0 };

            acc[key] = {
              quantity: current.quantity + ligne.quantite,
              amount: current.amount + Number(ligne.sous_total),
            };
          }

          return acc;
        }, {});

        const mergedLines: InvoiceLine[] = Object.entries(linesByArticle).map(([title, aggregate], index) => ({
          id: String(index + 1),
          title,
          quantity: aggregate.quantity,
          amount: Number(aggregate.amount.toFixed(2)),
        }));

        const mergedTotal = factureCommandes.reduce((sum, commande) => sum + Number(commande.total ?? 0), 0);

        const latestCommande = factureCommandes[0];

        setInvoiceLines(mergedLines);
        setInvoiceRef(`#INV-${String(latestCommande.id).padStart(5, "0")}-${factureCommandes.length}`);
        setTotalTtc(Number(mergedTotal.toFixed(2)));
      } catch {
        setInvoiceLines([]);
        setInvoiceRef("#INV-00000");
        setTotalTtc(0);
      }
    };

    loadFactureData();
  }, [tableId]);

  const subtotal = useMemo(() => totalTtc / 1.2, [totalTtc]);
  const vat = useMemo(() => totalTtc - subtotal, [totalTtc, subtotal]);

  if (!jakartaLoaded || !workSansLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.scaleDown]}>
            <MaterialCommunityIcons name="arrow-left" size={Math.round(34 * uiScale)} color="#0f1f39" />
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: Math.round(48 * uiScale) }]}>{`Table ${tableId ?? "42"}`}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.round(176 * verticalScale),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionRow}>
          <View style={styles.sectionAccent} />
          <Text style={[styles.sectionLabel, { fontSize: Math.round(15 * uiScale) }]}>RECAPITULATIF COMMANDES</Text>
          <Text style={[styles.invoiceRef, { fontSize: Math.round(14 * uiScale) }]}>{invoiceRef}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.linesWrap}>
            {invoiceLines.map((line) => (
              <View key={line.id} style={styles.lineRow}>
                <View style={styles.lineLeft}>
                  <Text style={[styles.qtyText, { fontSize: Math.round(20 * uiScale) }]}>{`${line.quantity}x`}</Text>
                  <Text style={[styles.itemText, { fontSize: Math.round(22 * uiScale) }]}>{line.title}</Text>
                </View>
                <Text style={[styles.amountText, { fontSize: Math.round(20 * uiScale) }]}>{`${line.amount.toFixed(2).replace(".", ",")} DH`}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalSubLabel, { fontSize: Math.round(18 * uiScale) }]}>Sous-total (HT)</Text>
              <Text style={[styles.totalSubAmount, { fontSize: Math.round(18 * uiScale) }]}>{`${subtotal.toFixed(2).replace(".", ",")} DH`}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalSubLabel, { fontSize: Math.round(18 * uiScale) }]}>TVA (10% & 20%)</Text>
              <Text style={[styles.totalSubAmount, { fontSize: Math.round(18 * uiScale) }]}>{`${vat.toFixed(2).replace(".", ",")} DH`}</Text>
            </View>

            <View style={styles.totalDivider} />

            <View style={styles.totalRowBottom}>
              <Text style={[styles.totalMainLabel, { fontSize: Math.round(24 * uiScale) }]}>Total (TTC)</Text>
              <Text style={[styles.totalMainAmount, { fontSize: Math.round(56 * uiScale) }]}>{`${totalTtc.toFixed(2).replace(".", ",")} DH`}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.paymentLabel, { fontSize: Math.round(15 * uiScale) }]}>MODE DE PAIEMENT</Text>

        <View style={styles.paymentGrid}>
          <PaymentMethodCard
            label="Especes"
            icon="cash"
            active={paymentMethod === "cash"}
            uiScale={uiScale}
            onPress={() => setPaymentMethod("cash")}
          />

          <PaymentMethodCard
            label="Carte Bancaire"
            icon="credit-card-outline"
            active={paymentMethod === "card"}
            uiScale={uiScale}
            onPress={() => setPaymentMethod("card")}
          />
        </View>
      </ScrollView>

      <View style={styles.footerWrap}>
        <Pressable style={({ pressed }) => [styles.footerButtonWrap, pressed && styles.scaleDown]}>
          <LinearGradient
            colors={["#007c34", "#22c55e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.footerButton}
          >
            <MaterialCommunityIcons name="printer" size={Math.round(34 * uiScale)} color="#ffffff" />
            <Text style={[styles.footerButtonText, { fontSize: Math.round(22 * uiScale) }]}>Imprimer / Generer Facture</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

type PaymentMethodCardProps = {
  label: string;
  icon: "cash" | "credit-card-outline";
  active: boolean;
  uiScale: number;
  onPress: () => void;
};

function PaymentMethodCard({ label, icon, active, uiScale, onPress }: PaymentMethodCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.paymentCard,
        active && styles.paymentCardActive,
        pressed && styles.scaleDown,
      ]}
    >
      <View style={[styles.paymentIconWrap, active && styles.paymentIconWrapActive]}>
        <MaterialCommunityIcons name={icon} size={Math.round(34 * uiScale)} color={active ? "#ffffff" : "#007c34"} />
      </View>

      <Text style={[styles.paymentText, { fontSize: Math.round(22 * uiScale) }]}>{label}</Text>

      {active ? (
        <View style={styles.checkBadge}>
          <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f3f8",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#f2f3f8",
  },
  header: {
    height: 84,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#f7f8fb",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe5ef",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0f1f39",
    letterSpacing: -0.6,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  sectionAccent: {
    width: 5,
    height: 30,
    borderRadius: 3,
    backgroundColor: "#007c34",
    marginLeft: -16,
  },
  sectionLabel: {
    flex: 1,
    fontFamily: "WorkSans_600SemiBold",
    letterSpacing: 2,
    color: "#7d8787",
  },
  invoiceRef: {
    fontFamily: "WorkSans_500Medium",
    color: "#4a544b",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e7ecf5",
  },
  linesWrap: {
    gap: 16,
    marginBottom: 16,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  lineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  qtyText: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#007c34",
  },
  itemText: {
    fontFamily: "WorkSans_600SemiBold",
    color: "#0f1f39",
    flexShrink: 1,
  },
  amountText: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#223858",
  },
  totalCard: {
    backgroundColor: "#e7ebf8",
    borderRadius: 24,
    padding: 16,
    gap: 10,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalSubLabel: {
    fontFamily: "WorkSans_500Medium",
    color: "#3f4d45",
  },
  totalSubAmount: {
    fontFamily: "WorkSans_600SemiBold",
    color: "#2f4136",
  },
  totalDivider: {
    borderTopWidth: 1,
    borderTopColor: "#cfd7ea",
    borderStyle: "dashed",
    marginTop: 4,
  },
  totalRowBottom: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalMainLabel: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0f1f39",
  },
  totalMainAmount: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0f1f39",
    letterSpacing: -0.8,
  },
  paymentLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: "WorkSans_600SemiBold",
    letterSpacing: 2,
    color: "#7d8787",
  },
  paymentGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  paymentCard: {
    flex: 1,
    minHeight: 204,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e7ecf5",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    position: "relative",
  },
  paymentCardActive: {
    borderColor: "#007c34",
    borderWidth: 3,
  },
  paymentIconWrap: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: "#dfe5f6",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIconWrapActive: {
    backgroundColor: "#007c34",
  },
  paymentText: {
    marginTop: 20,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0f1f39",
  },
  checkBadge: {
    position: "absolute",
    right: -12,
    top: -12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007c34",
    alignItems: "center",
    justifyContent: "center",
  },
  footerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: "#f7f8fb",
    borderTopWidth: 1,
    borderTopColor: "#e5ebf4",
  },
  footerButtonWrap: {
    borderRadius: 26,
    shadowColor: "#0e7d39",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  footerButton: {
    height: 100,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  footerButtonText: {
    color: "#ffffff",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  scaleDown: {
    transform: [{ scale: 0.96 }],
  },
});
