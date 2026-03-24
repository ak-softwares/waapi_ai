import { Stack } from "expo-router";
import { Sparkles, Wallet, Zap } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { useWallet } from "@/src/hooks/wallet/useWallet";
import { darkColors, lightColors } from "@/src/theme/colors";

const CREDIT_STEPS = [500, 1000, 2500, 5000, 10000];

export default function AddCreditScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { data } = useWallet();
  const [credits, setCredits] = useState<number>(500);
  const [customCredits, setCustomCredits] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const creditBalance = data?.creditBalance ?? 0;
  const pricePerCreditUSD = data?.pricePerCreditUSD ?? 0;

  const totalAmount = useMemo(
    () => Number((credits * pricePerCreditUSD).toFixed(2)),
    [credits, pricePerCreditUSD]
  );

  const applyCustomCredits = () => {
    const value = Number(customCredits);

    if (Number.isNaN(value)) {
      setError("Please enter a valid number");
      return;
    }

    if (value < 500) {
      setError("Minimum 500 credits required");
      return;
    }

    setError(null);
    setCredits(value);
  };

  const handlePayNow = () => {
    Alert.alert(
      "Payment setup required",
      "Razorpay checkout integration for this mobile screen is not wired yet."
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "Add Credits" }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Sparkles size={18} color={colors.primary} />
            <Text style={styles.title}>Add Message Credits</Text>
          </View>
          <View style={styles.balanceRow}>
            <Wallet size={14} color={colors.mutedText} />
            <Text style={styles.subtitle}>Current balance: {creditBalance.toLocaleString()} credits</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick select</Text>
          <View style={styles.optionsWrap}>
            {CREDIT_STEPS.map((step) => {
              const selected = step === credits;
              return (
                <Pressable
                  key={step}
                  style={[styles.optionChip, selected ? styles.optionChipSelected : null]}
                  onPress={() => {
                    setCredits(step);
                    setError(null);
                  }}
                >
                  <Text style={[styles.optionChipText, selected ? styles.optionChipTextSelected : null]}>
                    {step.toLocaleString()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom credits</Text>
          <View style={styles.customRow}>
            <TextInput
              value={customCredits}
              onChangeText={(value) => {
                setCustomCredits(value.replace(/\D/g, ""));
                setError(null);
              }}
              placeholder="Enter credits (min 500)"
              keyboardType="number-pad"
              style={[styles.input, error ? styles.inputError : null]}
              placeholderTextColor={colors.mutedText}
            />
            <Pressable style={styles.applyBtn} onPress={applyCustomCredits}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </Pressable>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.creditsPill}>
              <Zap size={14} color={colors.primary} />
              <Text style={styles.creditsPillText}>{credits.toLocaleString()} credits</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price / credit</Text>
            <Text style={styles.summaryValue}>${pricePerCreditUSD.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>

          <Text style={styles.note}>
            Credits apply only to our platform. WhatsApp API conversation fees are paid directly to Meta.
          </Text>
        </View>

        <Pressable style={styles.payBtn} onPress={handlePayNow}>
          <Text style={styles.payBtnText}>Pay ${totalAmount.toFixed(2)}</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 16,
      gap: 14,
    },

    headerCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      gap: 8,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },

    balanceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    subtitle: {
      color: colors.mutedText,
      fontSize: 13,
    },

    section: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      gap: 10,
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },

    optionsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    optionChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.background,
    },

    optionChipSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}22`,
    },

    optionChipText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },

    optionChipTextSelected: {
      color: colors.primary,
    },

    customRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },

    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      color: colors.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
    },

    inputError: {
      borderColor: colors.error,
    },

    applyBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },

    applyBtnText: {
      color: colors.onPrimary,
      fontWeight: "600",
      fontSize: 13,
    },

    errorText: {
      color: colors.error,
      fontSize: 12,
    },

    summaryCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      gap: 10,
    },

    summaryTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    summaryTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },

    creditsPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    creditsPillText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "700",
    },

    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    summaryLabel: {
      color: colors.mutedText,
      fontSize: 13,
    },

    summaryValue: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },

    totalValue: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "700",
    },

    note: {
      marginTop: 4,
      color: colors.mutedText,
      fontSize: 11,
      lineHeight: 16,
    },

    payBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 13,
      marginBottom: 8,
    },

    payBtnText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: "700",
    },
  });
