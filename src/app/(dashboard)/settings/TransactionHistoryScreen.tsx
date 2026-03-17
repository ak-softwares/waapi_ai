import { Stack } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { useTransactionHistory } from "@/src/hooks/transaction/useTransactionHistory";
import { darkColors, lightColors } from "@/src/theme/colors";
import {
  PaymentStatus,
  WalletTransactionType,
} from "@/src/types/WalletTransaction";
import { formatDateIST } from "@/src/utiles/formater/formatTime";

export default function TransactionHistoryScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    transactions,
    loading,
    loadingMore,
    hasMore,
    totalTransactions,
    filterByType,
    refreshTransactions,
    loadMore,
  } = useTransactionHistory();

  const getTransactionLabel = (type: WalletTransactionType) => {
    if (type === WalletTransactionType.CREDIT) return "Credit";
    if (type === WalletTransactionType.REFUND) return "Refund";
    if (type === WalletTransactionType.ADJUSTMENT) return "Adjustment";
    return "Debit";
  };

  const renderStatus = (status: PaymentStatus) => {
    let bg = colors.surface;
    let text = colors.text;

    if (status === PaymentStatus.SUCCESS) {
      bg = "#DCFCE7";
      text = "#166534";
    }
    if (status === PaymentStatus.PENDING || status === PaymentStatus.PROCESSING) {
      bg = "#FEF9C3";
      text = "#854D0E";
    }
    if (status === PaymentStatus.FAILED) {
      bg = "#FEE2E2";
      text = "#7F1D1D";
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusText, { color: text }]}>{status}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Left */}
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text style={styles.title}>
              {getTransactionLabel(item.type)}
            </Text>
            {renderStatus(item.paymentStatus)}
          </View>

          <Text style={styles.meta}>
            {formatDateIST(item.createdAt)}
          </Text>

          {(item.orderId || item.paymentId) && (
            <Text style={styles.meta}>
              {[
                item.orderId && `Order: ${item.orderId}`,
                item.paymentId && `Payment: ${item.paymentId}`,
              ]
                .filter(Boolean)
                .join(" • ")}
            </Text>
          )}
        </View>

        {/* Right */}
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.credits}>{item.credits} credits</Text>
          <Text style={styles.meta}>
            {item.amount} {item.currency}
          </Text>
          <Text style={styles.meta}>
            {item.creditsBefore} → {item.creditsAfter}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: `Transactions (${totalTransactions})`,
        }}
      />

      <View style={styles.container}>
        {/* List */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id!}
            renderItem={renderItem}
            refreshing={loading}
            onRefresh={refreshTransactions}
            onEndReached={() => {
              if (hasMore && !loadingMore) loadMore();
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginVertical: 20 }}
                />
              ) : null
            }
            ListEmptyComponent={
              <Text style={styles.empty}>No transactions found</Text>
            }
          />
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
    },

    filter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      marginBottom: 12,
      paddingHorizontal: 8,
    },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 10,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    title: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    credits: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    meta: {
      fontSize: 12,
      color: colors.mutedText,
      marginTop: 2,
    },

    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      marginLeft: 6,
    },

    statusText: {
      fontSize: 10,
      fontWeight: "600",
    },

    empty: {
      textAlign: "center",
      marginTop: 40,
      color: colors.mutedText,
    },
  });