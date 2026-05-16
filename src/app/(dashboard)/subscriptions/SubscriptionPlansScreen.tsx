import { useTheme } from "@/src/context/ThemeContext";
import { useRazorpaySubscription } from "@/src/hooks/razorpay/useRazorpaySubscription";
import { usePlans } from "@/src/hooks/subscription/usePlans";
import { useSubscriptionUsage } from "@/src/hooks/subscription/useSubscriptionUsage";
import { darkColors, lightColors } from "@/src/theme/colors";
import { BillingCycle, Currency, FormattedPlan, PlanTier } from "@/src/types/Plans";
import { router, Stack } from "expo-router";
import { Check, ChevronDown, ExternalLink } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ── Static data ──────────────────────────────────────── */
const ALL_FEATURES = [
  { icon: "🤖", label: "AI Assistant (24/7 smart replies)" },
  { icon: "🧠", label: "AI Agent (autonomous workflows)" },
  { icon: "📢", label: "Unlimited broadcast campaigns" },
  { icon: "👥", label: "Unlimited contacts" },
  { icon: "📊", label: "Advanced analytics dashboard" },
  { icon: "🔌", label: "Full API access" },
  { icon: "📱", label: "WhatsApp Business API integration" },
  { icon: "🎨", label: "Custom message templates" },
  { icon: "🔒", label: "Advanced security features" },
  { icon: "📞", label: "Priority support" },
];

const FAQS = [
  {
    q: "Are all features available on every plan?",
    a: "Yes! Every plan — including Free — includes our full feature set: AI Assistant, AI Agent, unlimited contacts, unlimited broadcasts, API access, and analytics. The only difference between plans is the number of messages included per month.",
  },
  {
    q: "What happens when I exceed my monthly message limit?",
    a: "When you reach your plan's message limit, you can either upgrade to the next plan or purchase additional messages at our standard rate. We'll notify you at 80% and 100% usage so you're never caught off guard.",
  },
  {
    q: "What are Facebook (Meta) API charges?",
    a: "Facebook's WhatsApp Business API charges are separate and billed directly by Meta to your Facebook Business Manager account. Our plan fees cover platform usage only. Meta charges vary by conversation type and region.",
  },
  {
    q: "How does the yearly discount work?",
    a: "Switch to annual billing and pay for 10 months instead of 12 — that's 2 months free. The discount applies immediately and your plan renews annually at the discounted rate.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Absolutely. Upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Our Free plan gives you 100 messages/month forever so you can test the platform before committing. No credit card required.",
  },
];

/* ── Layout constants ─────────────────────────────────── */
const { width: SW } = Dimensions.get("window");
const CARD_W = SW - 72;
const CARD_GAP = 14;
const SNAP = CARD_W + CARD_GAP;
const H_PAD = (SW - CARD_W) / 2;

/* ── Helpers ──────────────────────────────────────────── */
const CURRENCY_SYMBOL: Record<Currency, string> = { INR: "₹", USD: "$" };
const TIER_ORDER: Record<PlanTier, number> = {
  FREE: 0, STARTER: 1, GROWTH: 2, ENTERPRISE: 3,
};

function fmtPrice(plan: FormattedPlan) {
  if (plan.price == null) return "Custom";
  if (plan.price === 0) return "Free";
  return `${CURRENCY_SYMBOL[plan.currency]}${plan.price.toLocaleString(
    plan.currency === "INR" ? "en-IN" : "en-US"
  )}`;
}

function fmtMessages(v: number) {
  return v < 0 ? "Unlimited" : v.toLocaleString();
}

/* ── Glass palette derived from theme ────────────────── */
function useGlass(isDark: boolean, colors: typeof lightColors) {
  return useMemo(() => ({
    cardBg:         isDark ? "rgba(255,255,255,0.06)"  : "rgba(0,0,0,0.025)",
    cardBgFocused:  isDark ? "rgba(255,255,255,0.12)"  : `${colors.primary}0D`,
    border:         isDark ? "rgba(255,255,255,0.10)"  : "rgba(0,0,0,0.08)",
    borderFocused:  colors.primary,
    pillBg:         isDark ? "rgba(255,255,255,0.10)"  : colors.border,
    pillActive:     isDark ? "rgba(255,255,255,0.92)"  : colors.primary,
    pillText:       isDark ? "rgba(255,255,255,0.55)"  : colors.mutedText,
    pillTextActive: isDark ? "#000000"                 : colors.onPrimary,
    dot:            isDark ? "rgba(255,255,255,0.20)"  : "rgba(0,0,0,0.15)",
    dotActive:      colors.primary,
    sectionLine:    isDark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.06)",
    featureRow:     isDark ? "rgba(255,255,255,0.04)"  : "rgba(0,0,0,0.02)",
    faqBorder:      isDark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.07)",
    metaBg:         isDark ? "rgba(255,255,255,0.05)"  : `${colors.warning}12`,
    metaBorder:     isDark ? "rgba(255,255,255,0.10)"  : `${colors.warning}50`,
    savingsBg:      isDark ? "rgba(255,255,255,0.08)"  : `${colors.primary}12`,
    savingsBorder:  isDark ? "rgba(255,255,255,0.15)"  : `${colors.primary}40`,
  }), [isDark, colors]);
}

/* ── Plan card component ──────────────────────────────── */
function PlanCard({
  plan,
  isFocused,
  isCurrent,
  colors,
  glass,
}: {
  plan: FormattedPlan;
  isFocused: boolean;
  isCurrent: boolean;
  colors: typeof lightColors;
  glass: ReturnType<typeof useGlass>;
}) {
  const isEnterprise = plan.price == null;
  const isFree = plan.price === 0;

  return (
    <View
      style={[
        cardStyles.card,
        {
          width: CARD_W,
          backgroundColor: isFocused ? glass.cardBgFocused : glass.cardBg,
          borderColor: isFocused ? glass.borderFocused : glass.border,
          borderWidth: isFocused ? 1.5 : 1,
        },
      ]}
    >
      {/* Tier + badge */}
      <View style={cardStyles.topRow}>
        <Text style={[cardStyles.tier, { color: colors.mutedText }]}>{plan.tier}</Text>
        {isCurrent ? (
          <View style={[cardStyles.badge, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary, borderWidth: 1 }]}>
            <Check size={9} color={colors.primary} strokeWidth={3} />
            <Text style={[cardStyles.badgeText, { color: colors.primary }]}>Active</Text>
          </View>
        ) : plan.badge ? (
          <View style={[cardStyles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[cardStyles.badgeText, { color: colors.onPrimary }]}>{plan.badge}</Text>
          </View>
        ) : null}
      </View>

      {/* Plan name */}
      <Text style={[cardStyles.name, { color: colors.text }]}>{plan.name}</Text>

      {/* Price */}
      <View style={cardStyles.priceRow}>
        <Text style={[cardStyles.price, { color: colors.text }]}>{fmtPrice(plan)}</Text>
        {!isEnterprise && !isFree && (
          <Text style={[cardStyles.perMonth, { color: colors.mutedText }]}>/mo</Text>
        )}
      </View>

      {/* Divider */}
      <View style={[cardStyles.divider, { backgroundColor: glass.border }]} />

      {/* Messages */}
      <Text style={[cardStyles.msgCount, { color: colors.text }]}>
        {fmtMessages(plan.messagesPerMonth)}
      </Text>
      <Text style={[cardStyles.msgLabel, { color: colors.mutedText }]}>
        messages / month
      </Text>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 24,
    paddingBottom: 28,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tier: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  name: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    marginBottom: 22,
  },
  price: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 44,
  },
  perMonth: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 18,
  },
  msgCount: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  msgLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 3,
  },
});

/* ── FAQ item component ───────────────────────────────── */
function FaqItem({
  faq,
  isOpen,
  onToggle,
  colors,
  glass,
}: {
  faq: { q: string; a: string };
  isOpen: boolean;
  onToggle: () => void;
  colors: typeof lightColors;
  glass: ReturnType<typeof useGlass>;
}) {
  return (
    <View style={[faqStyles.item, { borderBottomColor: glass.faqBorder }]}>
      <Pressable onPress={onToggle} style={faqStyles.question}>
        <Text style={[faqStyles.questionText, { color: colors.text }]}>{faq.q}</Text>
        <ChevronDown
          size={16}
          color={colors.mutedText}
          style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
        />
      </Pressable>
      {isOpen && (
        <Text style={[faqStyles.answer, { color: colors.mutedText }]}>{faq.a}</Text>
      )}
    </View>
  );
}

const faqStyles = StyleSheet.create({
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
  },
  question: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  answer: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
});

/* ── Main screen ──────────────────────────────────────── */
export default function SubscriptionPlansScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const isDark = theme === "dark";
  const glass = useGlass(isDark, colors);

  const { data: usage, refetch: refetchUsage } = useSubscriptionUsage();
  const {
    plans,
    currency,
    setCurrency,
    billingCycle,
    setBillingCycle,
    loading,
    error,
    refetch,
  } = usePlans();
  const { initiateSubscription } = useRazorpaySubscription();

  const [focusedIdx, setFocusedIdx] = useState(0);
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const flatRef = useRef<FlatList>(null);

  const currentTier = usage?.subscriptionId ? usage.tier : null;
  const focusedPlan = plans[focusedIdx] ?? null;
  const isCurrent = focusedPlan?.tier === currentTier;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP);
      setFocusedIdx(Math.max(0, Math.min(idx, plans.length - 1)));
    },
    [plans.length]
  );

  const handleSelect = async () => {
    if (!focusedPlan || isCurrent || loadingTier) return;
    if (focusedPlan.tier === "ENTERPRISE") {
      router.push("/(dashboard)/settings/SupportScreen");
      return;
    }
    setLoadingTier(focusedPlan.tier);
    await initiateSubscription({
      tier: focusedPlan.tier,
      billing: billingCycle,
      currency,
      onSuccess: () => {
        Alert.alert(
          focusedPlan.tier === "FREE" ? "Free plan activated" : "Subscription started",
          "Your subscription will refresh shortly."
        );
        setLoadingTier(null);
        refetchUsage();
      },
      onFailure: (err) => {
        Alert.alert("Failed", err);
        setLoadingTier(null);
      },
    });
  };

  const btnLabel = () => {
    if (!focusedPlan) return "";
    if (isCurrent) return "Current Plan";
    if (focusedPlan.tier === "ENTERPRISE") return "Contact Sales";
    if (focusedPlan.price === 0) return "Switch to Free";
    const isDown =
      currentTier != null && TIER_ORDER[focusedPlan.tier] < TIER_ORDER[currentTier];
    return isDown ? "Downgrade" : "Upgrade";
  };

  /* helpers */
  const SectionHeader = ({ label }: { label: string }) => (
    <View style={[styles.sectionHead, { borderBottomColor: glass.sectionLine }]}>
      <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>{label}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Plans",
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontWeight: "800" },
          headerTintColor: colors.text,
        }}
      />

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
        {/* ── Toggles ──────────────────────────── */}
        <View style={styles.togglesRow}>
          {/* Billing cycle */}
          <View style={[styles.pill, { backgroundColor: glass.pillBg }]}>
            {(["MONTHLY", "YEARLY"] as BillingCycle[]).map((c) => (
              <Pressable
                key={c}
                onPress={() => setBillingCycle(c)}
                style={[
                  styles.pillSeg,
                  billingCycle === c && { backgroundColor: glass.pillActive },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: billingCycle === c ? glass.pillTextActive : glass.pillText },
                  ]}
                >
                  {c === "MONTHLY" ? "Monthly" : "Yearly"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Currency */}
          <View style={[styles.pill, { backgroundColor: glass.pillBg }]}>
            {(["INR", "USD"] as Currency[]).map((c) => (
              <Pressable
                key={c}
                onPress={() => setCurrency(c)}
                style={[
                  styles.pillSeg,
                  currency === c && { backgroundColor: glass.pillActive },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: currency === c ? glass.pillTextActive : glass.pillText },
                  ]}
                >
                  {CURRENCY_SYMBOL[c]} {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Yearly chip */}
        {billingCycle === "YEARLY" && (
          <View style={[styles.savingsChip, { backgroundColor: glass.savingsBg, borderColor: glass.savingsBorder }]}>
            <Text style={[styles.savingsText, { color: colors.primary }]}>
              🎉  Pay 10 months, get 2 months free
            </Text>
          </View>
        )}

        {/* ── Plan slider ───────────────────────── */}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 80 }} />
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : (
          <>
            <FlatList
              ref={flatRef}
              horizontal
              data={plans}
              keyExtractor={(p) => p.tier}
              renderItem={({ item, index }) => (
                <PlanCard
                  plan={item}
                  isFocused={index === focusedIdx}
                  isCurrent={item.tier === currentTier}
                  colors={colors}
                  glass={glass}
                />
              )}
              snapToInterval={SNAP}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingHorizontal: H_PAD, gap: CARD_GAP }}
              style={{ marginHorizontal: -16 }}
            />

            {/* Dots */}
            <View style={styles.dotsRow}>
              {plans.map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    flatRef.current?.scrollToIndex({ index: i, animated: true });
                    setFocusedIdx(i);
                  }}
                >
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: glass.dot },
                      i === focusedIdx && [styles.dotActive, { backgroundColor: glass.dotActive }],
                    ]}
                  />
                </Pressable>
              ))}
            </View>

            {/* Plan details */}
            {focusedPlan && (
              <View style={styles.planDetail}>
                <Text style={[styles.planDetailName, { color: colors.text }]}>
                  {focusedPlan.name}
                </Text>
                <Text style={[styles.planDetailDesc, { color: colors.mutedText }]}>
                  {focusedPlan.description}
                </Text>
              </View>
            )}

            {/* CTA */}
            <Pressable
              onPress={handleSelect}
              disabled={isCurrent || !!loadingTier}
              style={({ pressed }) => [
                styles.cta,
                isCurrent
                  ? { backgroundColor: glass.cardBg, borderColor: glass.border, borderWidth: 1 }
                  : { backgroundColor: colors.primary },
                pressed && !isCurrent && { opacity: 0.78 },
              ]}
            >
              {loadingTier ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : isCurrent ? (
                <View style={styles.ctaRow}>
                  <Check size={14} color={colors.mutedText} strokeWidth={3} />
                  <Text style={[styles.ctaText, { color: colors.mutedText }]}>{btnLabel()}</Text>
                </View>
              ) : (
                <Text style={[styles.ctaText, { color: colors.onPrimary }]}>{btnLabel()}</Text>
              )}
            </Pressable>
          </>
        )}

        {/* ── Every plan includes ───────────────── */}
        <SectionHeader label="EVERYTHING INCLUDED" />
        <View style={styles.featuresGrid}>
          {ALL_FEATURES.map((f, i) => (
            <View
              key={i}
              style={[styles.featureItem, { backgroundColor: glass.featureRow }]}
            >
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[styles.featureLabel, { color: colors.text }]} numberOfLines={2}>
                {f.label}
              </Text>
              <Check size={13} color={colors.primary} strokeWidth={3} />
            </View>
          ))}
        </View>

        {/* ── FAQs ─────────────────────────────── */}
        <SectionHeader label="COMMON QUESTIONS" />
        <View>
          {FAQS.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              colors={colors}
              glass={glass}
            />
          ))}
        </View>

        {/* ── Meta note ────────────────────────── */}
        <View style={[styles.metaNote, { backgroundColor: glass.metaBg, borderColor: glass.metaBorder }]}>
          <Text style={[styles.metaTitle, { color: colors.text }]}>
            Meta / WhatsApp API charges are billed separately
          </Text>
          <Text style={[styles.metaBody, { color: colors.mutedText }]}>
            Our subscription fee covers platform access. Meta conversation charges vary by type and country.
          </Text>
          <Pressable
            style={styles.metaLink}
            onPress={() =>
              Linking.openURL("https://whatsappbusiness.com/products/platform-pricing/")
            }
          >
            <Text style={[styles.metaLinkText, { color: colors.primary }]}>
              View Meta pricing
            </Text>
            <ExternalLink size={11} color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

/* ── Styles ────────────────────────────────────────────── */
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 50,
    gap: 18,
  },

  /* Toggles */
  togglesRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: { flexDirection: "row", borderRadius: 999, padding: 3, gap: 2 },
  pillSeg: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: "700" },

  /* Savings chip */
  savingsChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  savingsText: { fontSize: 12, fontWeight: "700" },

  /* Dots */
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: -2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 20 },

  /* Plan detail */
  planDetail: { gap: 5 },
  planDetailName: { fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  planDetailDesc: { fontSize: 13, lineHeight: 19 },

  /* CTA */
  cta: {
    borderRadius: 16,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ctaText: { fontSize: 15, fontWeight: "900", letterSpacing: 0.1 },

  /* Section header */
  sectionHead: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 10,
    marginBottom: -4,
  },
  sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },

  /* Features grid */
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: "100%",
  },
  featureIcon: { fontSize: 16 },
  featureLabel: { flex: 1, fontSize: 13, fontWeight: "500", lineHeight: 18 },

  /* Meta note */
  metaNote: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  metaTitle: { fontSize: 13, fontWeight: "800" },
  metaBody: { fontSize: 12, lineHeight: 18 },
  metaLink: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  metaLinkText: { fontSize: 12, fontWeight: "700" },

  /* Error */
  errorText: { fontSize: 13, textAlign: "center", marginVertical: 32 },
});