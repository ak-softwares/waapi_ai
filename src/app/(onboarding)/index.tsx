import FloatingButton from "@/src/components/common/FloatingButton";
import YoutubeSection from "@/src/components/common/video/YoutubeSection";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BULK_FEATURES = [
  {
    icon: "📤",
    label: "Bulk Broadcast",
    desc: "Send messages to thousands instantly.",
    accent: "#007AFF",
  },
  {
    icon: "🤖",
    label: "AI Automation",
    desc: "Automate replies and workflows with AI.",
    accent: "#25D366",
  },
  {
    icon: "🌍",
    label: "75+ Countries",
    desc: "Trusted by businesses across 75+ countries.",
    accent: "#FF9500",
  },
  {
    icon: "🤝",
    label: "5,000+ Customers",
    desc: "Over 5K happy businesses rely on us every day.",
    accent: "#AF52DE",
  },
];

export default function OnboardingScreenTwo() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const isDark = theme === "dark";
  const styles = getStyles(colors, isDark);
  const { completeOnboarding } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const finishOnboarding = async () => {
    if (loading) return;
    setLoading(true);
    await completeOnboarding();
    router.replace("/(auth)/signin");
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            {/* Left: Logo / Brand */}
            <View style={styles.logoPill}>
              <Text style={styles.logoEmoji}>💬</Text>
              <Text style={styles.logoLabel}>WA API</Text>
            </View>

            {/* Right: Skip */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={finishOnboarding}
              style={styles.skipBtn}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* ── Official Partner Badge ── */}
          <View style={styles.partnerBadge}>
            <View style={styles.partnerBadgeInner}>
              <View style={styles.partnerIconRow}>
                <Text style={styles.partnerIcon}>🏅</Text>
                <Text style={styles.partnerTitle}>Official Business Partner</Text>
              </View>
              <Text style={styles.partnerSub}>
                Meta & WhatsApp Certified · BSP Verified
              </Text>
            </View>
          </View>

          {/* ── Hero Block ── */}
          <View style={styles.heroBlock}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>10K+</Text>
                <Text style={styles.statLabel}>Messages/min</Text>
              </View>
              <View style={[styles.statCard, styles.statCardMid]}>
                <Text style={[styles.statNum, styles.statNumGreen]}>99%</Text>
                <Text style={styles.statLabel}>Delivery rate</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>24/7</Text>
                <Text style={styles.statLabel}>AI Auto-reply</Text>
              </View>
            </View>

            <Text style={styles.title}>
              Broadcast Smarter. Automate Faster.          
            </Text>
            <Text style={styles.description}>
              Scale with automated WhatsApp messaging and smart campaigns.
            </Text>
          </View>

          {/* ── Feature Grid ── */}
          <View style={styles.featureGrid}>
            {BULK_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureHeader}>
                  <View
                    style={[
                      styles.featureIconWrap,
                      {
                        backgroundColor: f.accent + "18",
                        borderColor: f.accent + "30",
                      },
                    ]}
                  >
                    <Text style={styles.featureIcon}>{f.icon}</Text>
                  </View>

                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>

                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* ── Video Section ── */}
          <YoutubeSection
            videoId="Vmm4yY9enqA"
            title="▶ WhatsApp API Integration"
            subtitle="Connect & start messaging"
            autoplay
            colors={colors}
          />

          {/* ── Trust Strip ── */}
          <View style={styles.trustStrip}>
            <Text style={styles.trustText}>
              🔒 Secure  ·  ✅ Official WhatsApp API  ·  ⚡ Instant Setup
            </Text>
          </View>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </ScrollView>

        {/* ── Floating Get Started Button ── */}
        <FloatingButton
          icon="arrow-forward"
          onPress={finishOnboarding}
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof lightColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: 15,
      paddingBottom: 40,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 20,
    },

    /* Logo */
    logoPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    logoEmoji: {
      fontSize: 14,
    },
    logoLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.4,
    },

    /* Skip button (clean, not heavy) */
    skipBtn: {
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    skipText: {
      color: colors.mutedText,
      fontSize: 13,
      fontWeight: "600",
    },

    /* Hero */
    heroBlock: { marginBottom: 24, gap: 14 },
    statsRow: {
      flexDirection: "row",
      gap: 8,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      alignItems: "center",
      gap: 2,
    },
    statCardMid: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    statNum: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    statNumGreen: { color: colors.text },
    statLabel: {
      color: colors.mutedText,
      fontSize: 10,
      fontWeight: "500",
      textAlign: "center",
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: "800",
      lineHeight: 30,
      letterSpacing: -0.5,
    },
    description: {
      color: colors.mutedText,
      fontSize: 14,
      lineHeight: 20,
      marginTop: -8,
    },
    /* ── Partner Badge ── */
    partnerBadge: {
      marginBottom: 18,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#25D36640",
      backgroundColor: isDark ? "#25D36610" : "#25D36608",
    },
    partnerBadgeInner: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap: 4,
    },
    partnerIconRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    partnerIcon: {
      fontSize: 18,
    },
    partnerTitle: {
      color: "#25D366",
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    partnerSub: {
      color: colors.mutedText,
      fontSize: 12,
      fontWeight: "500",
      marginLeft: 26,
    },
    /* Feature Grid */
    featureGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between", // key fix
    },
    featureCard: {
      flexBasis: "48%", // 2 columns with spacing
      maxWidth: "48%",
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 15,
      gap: 8,
    },
    featureHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    featureIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    featureIcon: { fontSize: 20 },
    featureLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
      flexShrink: 1, // prevents overflow
    },
    featureDesc: {
      color: colors.mutedText,
      fontSize: 11,
      lineHeight: 16,
    },

    /* Video */
    videoSection: { marginBottom: 20 },
    videoLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    videoTag: {
      backgroundColor: "#FF000015",
      borderRadius: 6,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: "#FF000030",
    },
    videoTagText: {
      color: "#FF3B30",
      fontSize: 11,
      fontWeight: "700",
    },
    videoSubtitle: {
      color: colors.mutedText,
      fontSize: 13,
      fontWeight: "500",
    },
    videoWrapper: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "#000",
    },
    webview: { flex: 1, backgroundColor: "#000" },

    /* Trust strip */
    trustStrip: {
      backgroundColor: isDark ? "#ffffff08" : "#00000006",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      alignItems: "center",
      marginBottom: 20,
    },
    trustText: {
      color: colors.mutedText,
      fontSize: 12,
      fontWeight: "500",
    },

    /* Dots */
    dotsRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 20,
      backgroundColor: colors.primary,
    },
  });