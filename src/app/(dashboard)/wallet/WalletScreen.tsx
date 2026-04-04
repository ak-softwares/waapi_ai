import { Stack, router } from "expo-router";
import { CircleAlert, Coins, Gift, RefreshCw, Wallet, Zap } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { useWallet } from "@/src/hooks/wallet/useWallet";
import { darkColors, lightColors } from "@/src/theme/colors";

export default function WalletScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { data, loading, error, refetch } = useWallet();

  const totalFreeMonthlyCredits = data?.freeMonthlyMessages ?? 0;
  const usedThisMonth = data?.currentMonthUsed ?? 0;
  const creditBalance = data?.creditBalance ?? 0;
  const pricePerCreditUSD = data?.pricePerCreditUSD ?? 0;

  const remaining = Math.max(totalFreeMonthlyCredits - usedThisMonth, 0);
  const percentage =
    totalFreeMonthlyCredits > 0
      ? Math.min(100, Math.round((usedThisMonth / totalFreeMonthlyCredits) * 100))
      : 0;

  const isLow = percentage >= 80;

  const handleWatchAd = () => {
    router.push("/(dashboard)/wallet/EarnCreditsScreen");
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Wallet",
          // headerRight: () => (
          //   <TouchableOpacity onPress={refetch} style={{ paddingRight: 10 }}>
          //     <RefreshCw size={18} color={colors.text} />
          //   </TouchableOpacity>
          // ),
        }} 
      />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.titleWrap}>
                  <Zap size={16} color={colors.primary} />
                  <Text style={styles.cardTitle}>Free Message Quota</Text>
                </View>
                <View style={[styles.badge, isLow ? styles.badgeDanger : styles.badgeNormal]}>
                  <Text style={[styles.badgeText, isLow ? styles.badgeTextDanger : undefined]}>
                    {percentage}%
                  </Text>
                </View>
              </View>

              <Text style={styles.subText}>
                {remaining} remaining of {totalFreeMonthlyCredits} messages
              </Text>

              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${percentage}%` },
                    isLow ? styles.progressDanger : styles.progressNormal,
                  ]}
                />
              </View>

              <View style={styles.quotaRow}>
                <Text style={styles.metaText}>
                  {usedThisMonth} / {totalFreeMonthlyCredits} used
                </Text>
                <Text style={styles.metaText}>{remaining} remaining</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.titleWrap}>
                  <Wallet size={16} color={colors.primary} />
                  <Text style={styles.cardTitle}>Current Balance</Text>
                </View>
              </View>

              <Text style={styles.balance}>{creditBalance.toLocaleString()} credits</Text>
              <Text style={styles.metaText}>Avg. cost: ${pricePerCreditUSD} / credit</Text>

              <View style={styles.walletActions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => router.push("/(dashboard)/wallet/AddCreditScreen")}
                >
                  <Text style={styles.actionBtnText}>Add Credits</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => router.push("/(dashboard)/settings/TransactionHistoryScreen")}
                >
                  <Text style={styles.secondaryBtnText}>View Transactions</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.earnCard}>
              <View style={styles.titleWrap}>
                <Gift size={16} color={colors.primary} />
                <Text style={styles.cardTitle}>Earn Credits</Text>
              </View>
              <Text style={styles.subText}>Watch a short rewarded ad and claim bonus credits.</Text>
              <Pressable style={styles.rewardedBtn} onPress={handleWatchAd}>
                <Coins size={14} color={colors.primary} />
                <Text style={styles.refreshText}>Earn credit by watching ads</Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <CircleAlert size={14} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable style={styles.refreshBtn} onPress={refetch}>
              <RefreshCw size={14} color={colors.primary} />
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </>
        )}
      </View>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
      gap: 12,
    },

    loader: {
      marginTop: 40,
    },
    earnCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 8,
    },

    earnLink: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "700",
    },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 10,
    },

    cardHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    titleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    cardTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },

    subText: {
      color: colors.mutedText,
      fontSize: 12,
    },

    badge: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
    },

    badgeNormal: {
      borderColor: colors.border,
      backgroundColor: colors.background,
    },

    badgeDanger: {
      borderColor: "#dc2626",
      backgroundColor: "#dc2626",
    },

    badgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.text,
    },

    badgeTextDanger: {
      color: "#ffffff",
    },

    progressBg: {
      width: "100%",
      height: 8,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: colors.border,
    },

    progressFill: {
      height: "100%",
      borderRadius: 999,
    },

    progressNormal: {
      backgroundColor: "#10b981",
    },

    progressDanger: {
      backgroundColor: "#ef4444",
    },

    quotaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    metaText: {
      color: colors.mutedText,
      fontSize: 12,
    },

    balance: {
      color: colors.text,
      fontSize: 26,
      fontWeight: "700",
    },
    walletActions: {
      marginTop: 4,
      flexDirection: "row",
      gap: 8,
    },

    actionBtn: {
      flex: 1,
      marginTop: 4,
      backgroundColor: colors.primary,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
    },
    secondaryBtn: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
    },

    secondaryBtnText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    actionBtnText: {
      color: colors.onPrimary,
      fontSize: 13,
      fontWeight: "600",
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 10,
      padding: 10,
      backgroundColor: `${colors.error}12`,
    },

    errorText: {
      flex: 1,
      color: colors.error,
      fontSize: 12,
      fontWeight: "500",
    },

    refreshBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 10,
      backgroundColor: colors.surface,
    },

    rewardedBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 10,
      backgroundColor: colors.background,
    },

    refreshText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
  });
