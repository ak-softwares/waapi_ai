import { useOnboarding } from "@/src/context/OnboardingContext";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

const { width } = Dimensions.get("window");

const STATS = [
  { num: "1M+",  label: "Messages Sent", accent: "#25D366" },
  { num: "98%",  label: "Open Rate",     accent: "#FF9500" },
  { num: "500+", label: "Businesses",    accent: "#AF52DE" },
];

const FEATURES = [
  { icon: "📤", label: "Bulk Campaigns",    desc: "Send to thousands instantly", accent: "#25D366" },
  { icon: "👥", label: "Contact Manager",   desc: "Import, tag & segment lists",  accent: "#007AFF" },
  { icon: "🔔", label: "Scheduled Blasts",  desc: "Plan campaigns ahead",         accent: "#FF9500" },
  { icon: "💳", label: "Wallet & Credits",  desc: "Monitor spend in real time",   accent: "#AF52DE" },
];

const YOUTUBE_HTML = (id: string) => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#000;}
.w{position:relative;width:100%;padding-bottom:56.25%;height:0;}
iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none;}</style>
</head><body><div class="w">
<iframe src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1"
allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
allowfullscreen></iframe></div></body></html>`;

export default function OnboardingScreenTwo() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const isDark = theme === "dark";
  const s = getStyles(colors, isDark);
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
    <SafeAreaView style={s.container}>

      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        {/* Back button */}
        <TouchableOpacity
          style={s.backBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backText}>Back</Text>
        </TouchableOpacity>

        <View style={s.badge}>
          <Text style={s.badgeText}>2 / 2</Text>
        </View>
      </View>

      {/* ── Title ── */}
      <View style={s.titleBlock}>
        <View style={s.logoPill}>
          <Text style={s.logoEmoji}>🚀</Text>
          <Text style={s.logoLabel}>Bulk Messaging</Text>
        </View>
        <Text style={s.title}>Reach Everyone,{"\n"}All at Once</Text>
        <Text style={s.subtitle}>
          Launch WhatsApp campaigns, automate follow-ups,
          and grow your business — zero technical hassle.
        </Text>
      </View>

      {/* ── Stats Row ── */}
      <View style={s.statsRow}>
        {STATS.map((st, i) => (
          <View
            key={i}
            style={[
              s.statCard,
              { borderColor: st.accent + "40", backgroundColor: st.accent + "12" },
            ]}
          >
            <Text style={[s.statNum, { color: st.accent }]}>{st.num}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Feature Grid ── */}
      <View style={s.featureGrid}>
        {FEATURES.map((f, i) => (
          <View key={i} style={s.featureCard}>
            <View
              style={[
                s.iconWrap,
                { backgroundColor: f.accent + "18", borderColor: f.accent + "30" },
              ]}
            >
              <Text style={s.featureIcon}>{f.icon}</Text>
            </View>
            <Text style={s.featureLabel}>{f.label}</Text>
            <Text style={s.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* ── Video ── */}
      <View style={s.videoBlock}>
        <View style={s.videoLabelRow}>
          <View style={s.videoTag}>
            <Text style={s.videoTagText}>▶  Integration Guide</Text>
          </View>
          <Text style={s.videoHint}>Send bulk messages easily</Text>
        </View>
        <View style={s.videoWrapper}>
          <WebView
            style={s.webview}
            source={{ html: YOUTUBE_HTML("Vmm4yY9enqA") }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            scrollEnabled={false}
          />
        </View>
      </View>

      {/* ── Trust Strip ── */}
      <View style={s.trustStrip}>
        <Text style={s.trustText}>
          🔒 Secure  ·  ✅ Official WhatsApp API  ·  ⚡ Instant Setup
        </Text>
      </View>

      {/* ── Progress Dots ── */}
      <View style={s.dotsRow}>
        <View style={s.dot} />
        <View style={[s.dot, s.dotActive]} />
      </View>

      {/* ── Floating Get Started Button ── */}
      <View style={s.floatingBar}>
        <TouchableOpacity
          style={[s.button, loading && s.buttonDisabled]}
          activeOpacity={0.85}
          onPress={finishOnboarding}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.buttonText}>🚀  Get Started</Text>
          )}
        </TouchableOpacity>
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

    /* Top Bar */
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 10,
      marginBottom: 14,
    },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 5,
    },
    backArrow: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      lineHeight: 18,
    },
    backText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    badge: {
      backgroundColor: colors.surface,
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeText: {
      color: colors.mutedText,
      fontSize: 12,
      fontWeight: "600",
    },

    /* Title */
    titleBlock: {
      paddingHorizontal: 20,
      marginBottom: 14,
      gap: 6,
    },
    logoPill: {
      flexDirection: "row",
      alignSelf: "flex-start",
      alignItems: "center",
      backgroundColor: "#25D36620",
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: "#25D36640",
      gap: 5,
      marginBottom: 2,
    },
    logoEmoji: { fontSize: 13 },
    logoLabel: {
      color: "#25D366",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "800",
      lineHeight: 30,
      letterSpacing: -0.4,
    },
    subtitle: {
      color: colors.mutedText,
      fontSize: 13,
      lineHeight: 19,
    },

    /* Stats */
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 12,
    },
    statCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 9,
      alignItems: "center",
      gap: 2,
    },
    statNum: { fontSize: 16, fontWeight: "800" },
    statLabel: { color: colors.mutedText, fontSize: 10, fontWeight: "500", textAlign: "center" },

    /* Feature Grid */
    featureGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 12,
    },
    featureCard: {
      width: (width - 56) / 2,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 11,
      gap: 5,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 9,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    featureIcon: { fontSize: 17 },
    featureLabel: { color: colors.text, fontSize: 12, fontWeight: "700" },
    featureDesc: { color: colors.mutedText, fontSize: 11, lineHeight: 15 },

    /* Video */
    videoBlock: {
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    videoLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 7,
    },
    videoTag: {
      backgroundColor: "#FF000015",
      borderRadius: 6,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: "#FF000030",
    },
    videoTagText: { color: "#FF3B30", fontSize: 11, fontWeight: "700" },
    videoHint: { color: colors.mutedText, fontSize: 12, fontWeight: "500" },
    videoWrapper: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "#000",
    },
    webview: { flex: 1, backgroundColor: "#000" },

    /* Trust strip */
    trustStrip: {
      marginHorizontal: 20,
      backgroundColor: isDark ? "#ffffff08" : "#00000006",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 8,
      alignItems: "center",
      marginBottom: 10,
    },
    trustText: {
      color: colors.mutedText,
      fontSize: 11,
      fontWeight: "500",
    },

    /* Dots */
    dotsRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginBottom: 80,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    dotActive: { width: 20, backgroundColor: "#25D366" },

    /* Floating bar */
    floatingBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingBottom: 28,
      paddingTop: 12,
      backgroundColor: isDark ? colors.background + "F2" : colors.background + "F5",
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      backgroundColor: "#25D366",
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 52,
      paddingVertical: 15,
      shadowColor: "#25D366",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
  });