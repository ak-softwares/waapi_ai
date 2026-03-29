import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";

const Shimmer = createShimmerPlaceholder(LinearGradient);

type Props = {
  count?: number;
  paddingHorizontal?: number;
};

export default function UserShimmer({ count = 8, paddingHorizontal = 0 }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const styles = getStyles(colors, paddingHorizontal);

  const shimmerColors =
    theme === "dark"
      ? ["#1e1e1e", "#2a2a2a", "#1e1e1e"]
      : ["#e0e0e0", "#f5f5f5", "#e0e0e0"];

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => {
        // 🔥 random widths (realistic UI)
        const nameWidth = `${50 + Math.random() * 30}%`;
        const messageWidth = `${60 + Math.random() * 30}%`;

        return (
          <View key={i} style={styles.chatTile}>
            {/* Avatar */}
            <Shimmer style={styles.avatar} shimmerColors={shimmerColors} />

            {/* Content */}
            <View style={styles.content}>
              {/* Top Row */}
              <View style={styles.row}>
                <Shimmer
                  style={[styles.name, { width: nameWidth }]}
                  shimmerColors={shimmerColors}
                />
              </View>

              {/* Bottom Row */}
              <View style={styles.row}>
                <Shimmer
                  style={[styles.message, { width: messageWidth }]}
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

const getStyles = (colors: typeof lightColors, paddingHorizontal: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: paddingHorizontal,
      backgroundColor: colors.background,
    },

    chatTile: {
      flexDirection: "row",
      paddingVertical: 14,
      paddingHorizontal: 6,
      borderRadius: 12,
      marginBottom: 6,

      // subtle card feel (optional)
      backgroundColor: colors.background,
    },

    avatar: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      marginRight: 10,
    },

    content: {
      flex: 1,
      justifyContent: "center",
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    name: {
      height: 14,
      borderRadius: 6,
      maxWidth: "75%",
    },

    time: {
      width: 40,
      height: 10,
      borderRadius: 4,
      marginLeft: 10,
    },

    message: {
      height: 12,
      borderRadius: 6,
      marginTop: 6,
      maxWidth: "85%",
    },

    unread: {
      width: 22,
      height: 22,
      borderRadius: 11,
      marginLeft: 10,
    },
  });