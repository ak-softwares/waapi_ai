import FloatingButton from "@/src/components/common/FloatingButton";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");

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
    icon: "⚡",
    label: "Smart Campaigns",
    desc: "Run targeted campaigns with ease.",
    accent: "#FF9500",
  },
  {
    icon: "📊",
    label: "Analytics & Tracking",
    desc: "Track delivery and performance in real time.",
    accent: "#AF52DE",
  },
];

const YOUTUBE_HTML = (videoId: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #000; }
      iframe {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        border: none;
      }
      .wrap { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <iframe
        src="https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=1&mute=1&controls=1&rel=0&modestbranding=1"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    </div>
  </body>
</html>
`;

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
          <View style={styles.videoSection}>
            <View style={styles.videoLabelRow}>
              <View style={styles.videoTag}>
                <Text style={styles.videoTagText}>▶ Integration Guide</Text>
              </View>
              <Text style={styles.videoSubtitle}>
                Send bulk messages easily
              </Text>
            </View>

            <View style={styles.videoWrapper}>
              <YoutubePlayer
                height={220}
                play={true}
                videoId={"Vmm4yY9enqA"}
              />
            </View>
          </View>

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
      backgroundColor: "#25D36615",
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: "#25D36630",
      gap: 6,
    },
    logoEmoji: {
      fontSize: 14,
    },
    logoLabel: {
      color: "#25D366",
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
      borderColor: "#25D36640",
      backgroundColor: "#25D36610",
    },
    statNum: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    statNumGreen: { color: "#25D366" },
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
      backgroundColor: "#25D366",
    },
  });