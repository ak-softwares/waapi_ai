import { useTheme } from "@/src/context/ThemeContext";
import { useSubscriptionUsage } from "@/src/hooks/subscription/useSubscriptionUsage";
import { darkColors, lightColors } from "@/src/theme/colors";
import { router, Stack } from "expo-router";
import {
  AlertCircle,
  ChevronRight,
  History,
  Zap
} from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatMessages(value: number) {
  if (value < 0) return "∞";
  return value.toLocaleString();
}

function formatRenewDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ManageSubscriptionScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const {
    data: usage,
    loading,
    error,
    refetch,
  } = useSubscriptionUsage();

  const messageLimit   = usage?.messageLimit ?? 0;
  const usedMessages   = usage?.usedMessages ?? 0;
  const usagePercent   = messageLimit < 0 ? 0 : Math.min(100, usage?.usagePercent ?? 0);
  const remaining      = messageLimit < 0 ? "∞" : (usage?.remainingMessages ?? 0).toLocaleString();
  const isUnlimited    = messageLimit < 0;
  const isFree         = usage?.tier === "FREE";

  return (
    <>
      <Stack.Screen options={{ title: "Subscription" }} />

      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Plan hero ─────────────────────────────────── */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          {loading ? (
            <ActivityIndicator color="#fff" style={{ marginVertical: 24 }} />
          ) : error || !usage ? (
            <View style={styles.errorWrap}>
              <AlertCircle size={20} color="#fff" />
              <Text style={styles.errorText}>
                {error || "Could not load subscription"}
              </Text>
            </View>
          ) : (
            <>
              {/* Plan name + badge */}
              <View style={styles.heroTop}>
                <View style={styles.heroLeft}>
                  <Text style={styles.heroLabel}>Current plan</Text>
                  <Text style={styles.heroPlan}>{usage.planName}</Text>
                  {usage.billing ? (
                    <Text style={styles.heroBilling}>
                      {usage.billing === "YEARLY" ? "Billed yearly" : "Billed monthly"}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <Text style={styles.statusBadgeText}>
                    {usage.subscriptionId ? "Active" : "Free"}
                  </Text>
                </View>
              </View>

              {/* Usage stats row */}
              <View style={styles.statsRow}>
                <StatBox label="Used"      value={usedMessages.toLocaleString()} />
                <View style={styles.statDivider} />
                <StatBox label="Limit"     value={formatMessages(messageLimit)} />
                <View style={styles.statDivider} />
                <StatBox label="Remaining" value={remaining} />
              </View>

              {/* Progress bar */}
              {!isUnlimited && (
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${usagePercent}%` },
                      usagePercent > 80 && { backgroundColor: "#f97316" },
                    ]}
                  />
                </View>
              )}

              {/* Renew */}
              <Text style={styles.heroRenew}>
                {isFree ? "Resets" : "Renews"} {formatRenewDate(usage.renewsAt)}
              </Text>
            </>
          )}
        </View>

        {/* ── Actions ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
            MANAGE
          </Text>

          <ActionRow
            icon={<Zap size={18} color={colors.primary} />}
            label="Change plan"
            sublabel="Upgrade or downgrade your subscription"
            tint={`${colors.primary}15`}
            colors={colors}
            onPress={() =>
              router.push("/(dashboard)/subscriptions/SubscriptionPlansScreen")
            }
          />

          <ActionRow
            icon={<History size={18} color={colors.primary} />}
            label="Payment history"
            sublabel="View past invoices and receipts"
            tint={`${colors.primary}15`}
            colors={colors}
            onPress={() =>
              router.push("/(dashboard)/subscriptions/PaymentHistoryScreen")
            }
          />
        </View>
      </ScrollView>
    </>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  sublabel,
  tint,
  colors,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  tint: string;
  colors: typeof lightColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        { borderBottomColor: colors.border },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: tint }]}>{icon}</View>
      <View style={styles.actionText}>
        <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.actionSublabel, { color: colors.mutedText }]}>
          {sublabel}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.mutedText} />
    </Pressable>
  );
}

/* ── Styles ────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },

  /* Hero */
  hero: {
    padding: 24,
    paddingBottom: 28,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroLeft: {
    flex: 1,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroPlan: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  heroBilling: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 4,
    textTransform: "capitalize",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 3,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  /* Progress */
  progressBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 999,
  },

  heroRenew: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "500",
  },

  /* Error inside hero */
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  errorText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  /* Section */
  section: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },

  /* Action rows */
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  actionSublabel: {
    fontSize: 12,
  },
});