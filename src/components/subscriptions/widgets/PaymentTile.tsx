import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { PaymentHistory, PaymentStatus } from "@/src/types/PaymentHistory";
import { Currency } from "@/src/types/Plans";
import { formatDateIST } from "@/src/utils/formater/formatTime";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

const CURRENCY_SYMBOL: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
};

const STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string }> = {
  [PaymentStatus.AUTHENTICATED]: { bg: "#EDE9FE", text: "#5B21B6" },
  [PaymentStatus.PENDING]:       { bg: "#FEF3C7", text: "#92400E" },
  [PaymentStatus.ACTIVE]:        { bg: "#DBEAFE", text: "#1D4ED8" },
  [PaymentStatus.HALTED]:        { bg: "#FFEDD5", text: "#9A3412" },
  [PaymentStatus.CANCELLED]:     { bg: "#F3F4F6", text: "#4B5563" },
  [PaymentStatus.COMPLETED]:     { bg: "#DCFCE7", text: "#166534" },
  [PaymentStatus.FAILED]:        { bg: "#FEE2E2", text: "#991B1B" },
  [PaymentStatus.PAID]:          { bg: "#DCFCE7", text: "#166534" },
};

function formatAmount(amount: number, currency: Currency) {
  return `${CURRENCY_SYMBOL[currency]}${new Intl.NumberFormat(
    currency === "INR" ? "en-IN" : "en-US",
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  ).format(amount / 100)}`;
}

interface PaymentTileProps {
  payment: PaymentHistory;
}

export default function PaymentTile({ payment }: PaymentTileProps) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const status = STATUS_COLORS[payment.status] ?? STATUS_COLORS[PaymentStatus.PENDING];
  const isPendingAction = [
    PaymentStatus.PENDING,
    PaymentStatus.HALTED,
    PaymentStatus.FAILED,
  ].includes(payment.status);

  return (
    <Pressable style={styles.container}>
      {/* Icon */}
      <View style={styles.iconWrap}>
        <Text style={styles.iconEmoji}>🧾</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {payment.tier} · {payment.billing === "YEARLY" ? "Yearly" : "Monthly"}
        </Text>
        <Text style={styles.meta}>
          {payment.createdAt ? formatDateIST(payment.createdAt) : "—"}
        </Text>
        {isPendingAction && payment.shortUrl && (
          <Text
            style={styles.completeLink}
            onPress={() => Linking.openURL(payment.shortUrl!)}
          >
            Complete payment ↗
          </Text>
        )}
      </View>

      {/* Right */}
      <View style={styles.right}>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>
            {payment.status}
          </Text>
        </View>
        <Text style={styles.amount}>
          {formatAmount(payment.price, payment.currency)}
        </Text>
      </View>
    </Pressable>
  );

  function getStyles(colors: typeof lightColors) {
    return StyleSheet.create({
      container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background,
      },
      iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: `${colors.primary}15`,
        alignItems: "center",
        justifyContent: "center",
      },
      iconEmoji: {
        fontSize: 18,
      },
      content: {
        flex: 1,
        gap: 3,
      },
      title: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "600",
      },
      meta: {
        color: colors.mutedText,
        fontSize: 12,
      },
      completeLink: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "700",
        marginTop: 2,
      },
      right: {
        alignItems: "flex-end",
        gap: 5,
      },
      statusBadge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
      },
      statusText: {
        fontSize: 10,
        fontWeight: "800",
        textTransform: "capitalize",
      },
      amount: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "800",
      },
    });
  }
}