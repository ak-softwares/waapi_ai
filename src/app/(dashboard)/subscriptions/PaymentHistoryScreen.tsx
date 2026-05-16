import PaymentShimmer from "@/src/components/subscriptions/widgets/PaymentShimmer";
import PaymentTile from "@/src/components/subscriptions/widgets/PaymentTile";
import { useTheme } from "@/src/context/ThemeContext";
import { usePaymentHistory } from "@/src/hooks/subscription/usePaymentHistory";
import { darkColors, lightColors } from "@/src/theme/colors";
import { PaymentHistory } from "@/src/types/PaymentHistory";
import { Stack } from "expo-router";
import { CreditCard } from "lucide-react-native";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function PaymentHistoryScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const {
    paymentHistory,
    loading,
    loadingMore,
    hasMore,
    totalRecords,
    loadMore,
    refreshPaymentHistory,
  } = usePaymentHistory();

  const renderItem = ({ item }: { item: PaymentHistory }) => (
    <PaymentTile payment={item} />
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: `Payments (${totalRecords})`,
        }}
      />

      {loading ? (
        <View style={[styles.shimmerWrapper, { backgroundColor: colors.background }]}>
          <PaymentShimmer count={10} />
        </View>
      ) : (
        <FlatList
          data={paymentHistory}
          keyExtractor={(item, index) =>
            item._id ?? `${item.subscriptionId}-${index}`
          }
          renderItem={renderItem}
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={[
            styles.listContent,
            paymentHistory.length === 0 && styles.emptyContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refreshPaymentHistory}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasMore && !loadingMore && !loading) {
              loadMore();
            }
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <CreditCard size={28} color={colors.mutedText} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No payment records found
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                Your subscription receipts will appear here.
              </Text>
            </View>
          }
          ListFooterComponent={loadingMore ? <PaymentShimmer count={2} /> : null}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  shimmerWrapper: {
    flex: 1,
    paddingTop: 16,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 30,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyBox: {
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 6,
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
  },
});