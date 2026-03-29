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

export default function MessageBubbleShimmer({ count = 10 }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => {
        const isMine = Math.random() > 0.5;

        const adjustColor = (hex: string, amount: number) => {
          const num = parseInt(hex.replace("#", ""), 16);

          const r = Math.min(255, Math.max(0, (num >> 16) + amount));
          const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
          const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));

          return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
        };

        const baseColor = isMine
          ? colors.messageBubbleMine
          : colors.messageBubbleOther;

        // 🔥 Increased contrast (tuned)
        const shimmerColors =
          theme === "dark"
            ? [
                adjustColor(baseColor, 10),
                adjustColor(baseColor, 25),
                adjustColor(baseColor, 15),
              ]
            : [
                adjustColor(baseColor, -10),
                adjustColor(baseColor, -30),
                adjustColor(baseColor, -15), 
              ];

        // ✅ Random widths for realism
        const lineWidth1 = `${50 + Math.random() * 40}%`;
        const lineWidth2 = `${40 + Math.random() * 40}%`;

        return (
          <View
            key={i}
            style={[
              styles.row,
              { justifyContent: isMine ? "flex-end" : "flex-start" },
            ]}
          >
            <View
              style={[
                styles.bubble,
                isMine ? styles.mine : styles.other,
              ]}
            >
              {/* Line 1 */}
              <Shimmer
                style={[styles.line, { width: lineWidth1 }]}
                shimmerColors={shimmerColors}
              />

              {/* Line 2 */}
              <Shimmer
                style={[styles.lineSmall, { width: lineWidth2 }]}
                shimmerColors={shimmerColors}
              />

              {/* Meta (time/ticks) */}
              <View style={styles.metaRow}>
                <Shimmer
                  style={styles.meta}
                  shimmerColors={shimmerColors}
                />
              </View>
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
      paddingVertical: 10,
      justifyContent: "flex-end",
    },

    row: {
      flexDirection: "row",
      paddingHorizontal: 10,
      marginVertical: 4,
    },

    bubble: {
      maxWidth: "80%",
      padding: 10,
      borderRadius: 10,
    },

    mine: {
      backgroundColor: colors.messageBubbleMine,
      borderTopRightRadius: 0,
    },

    other: {
      backgroundColor: colors.messageBubbleOther,
      borderTopLeftRadius: 0,
    },

    line: {
      height: 14,
      borderRadius: 6,
      marginBottom: 6,
    },

    lineSmall: {
      height: 12,
      borderRadius: 6,
      marginBottom: 6,
    },

    metaRow: {
      alignItems: "flex-end",
      marginTop: 4,
    },

    meta: {
      width: 40,
      height: 10,
      borderRadius: 4,
    },
  });