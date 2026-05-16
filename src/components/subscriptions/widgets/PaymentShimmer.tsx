import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";

const Shimmer = createShimmerPlaceholder(LinearGradient);

type Props = {
  count?: number;
};

export default function PaymentShimmer({ count = 8 }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const shimmerColors =
    theme === "dark"
      ? ["#1e1e1e", "#2a2a2a", "#1e1e1e"]
      : ["#e0e0e0", "#f5f5f5", "#e0e0e0"];

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => {
        const titleWidth = `${200 + Math.random() * 25}%`;
        const metaWidth = `${100 + Math.random() * 20}%`;
        const amountWidth = `${20 + Math.random() * 15}%`;

        return (
          <View key={i} style={styles.row}>
            {/* Icon placeholder */}
            <Shimmer style={styles.icon} shimmerColors={shimmerColors} />

            {/* Content */}
            <View style={styles.content}>
              <Shimmer
                style={[styles.title, { width: titleWidth }]}
                shimmerColors={shimmerColors}
              />
              <Shimmer
                style={[styles.meta, { width: metaWidth }]}
                shimmerColors={shimmerColors}
              />
            </View>

            {/* Right side: badge + amount */}
            <View style={styles.right}>
              <Shimmer style={styles.badge} shimmerColors={shimmerColors} />
              <Shimmer
                style={[styles.amount, { width: amountWidth }]}
                shimmerColors={shimmerColors}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 10,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    icon: {
      width: 36,
      height: 36,
      borderRadius: 10,
    },
    content: {
      flex: 1,
      gap: 6,
    },
    title: {
      height: 13,
      borderRadius: 6,
    },
    meta: {
      height: 10,
      borderRadius: 5,
      marginTop: 2,
    },
    right: {
      alignItems: "flex-end",
      gap: 6,
    },
    badge: {
      width: 56,
      height: 18,
      borderRadius: 999,
    },
    amount: {
      height: 13,
      borderRadius: 6,
      minWidth: 48,
    },
  });