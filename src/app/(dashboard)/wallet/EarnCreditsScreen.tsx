import { Stack } from "expo-router";
import { Coins, Gift } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { REWARDED_CREDITS } from "@/src/ads/admobConfig";
import { useTheme } from "@/src/context/ThemeContext";
import { useRewardedAd } from "@/src/hooks/ads/useRewardedAd";
import { darkColors, lightColors } from "@/src/theme/colors";

export default function EarnCreditsScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);
  const { showAd, loaded } = useRewardedAd();

  const handleWatchAd = () => {
    showAd();
    // giveUserCredits(100); // ⚠️ move to reward callback in production
  };

  const actionLabel = loaded
    ?  `Watch Ad & Earn ${REWARDED_CREDITS} Credits`
    : "Loading ad..."

  return (
    <>
      <Stack.Screen options={{ title: "Earn Credits" }} />

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Gift size={18} color={colors.primary} />
            <Text style={styles.title}>Watch & Earn</Text>
          </View>

          <Text style={styles.subText}>
            Watch a short ad and receive {REWARDED_CREDITS} bonus credits after verification.
          </Text>

          <View style={styles.rewardPill}>
            <Coins size={14} color={colors.primary} />
            <Text style={styles.rewardPillText}>Reward: {REWARDED_CREDITS} credits</Text>
          </View>

          <Pressable
            style={[
              styles.cta,
              (!loaded) ? styles.ctaDisabled : undefined,
            ]}
            disabled={!loaded}
            onPress={handleWatchAd}
          >
            <Text style={styles.ctaText}>{actionLabel}</Text>
          </Pressable>

          {/* <Pressable style={styles.secondaryBtn} onPress={reload}>
            <RefreshCw size={14} color={colors.primary} />
            <Text style={styles.secondaryBtnText}>Reload Ad</Text>
          </Pressable> */}
        </View>

        {/* {error ? (
          <View style={styles.errorBox}>
            <CircleAlert size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null} */}
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
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      gap: 12,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    subText: {
      color: colors.mutedText,
      fontSize: 13,
      lineHeight: 20,
    },
    rewardPill: {
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    rewardPillText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 13,
    },
    cta: {
      borderRadius: 10,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    ctaDisabled: {
      opacity: 0.5,
    },
    ctaText: {
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 14,
    },
    secondaryBtn: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 11,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },
    secondaryBtnText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 13,
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
  });
