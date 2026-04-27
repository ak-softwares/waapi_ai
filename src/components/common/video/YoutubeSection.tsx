import React from "react";
import { StyleSheet, Text, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

type Props = {
  videoId: string;
  title?: string;
  subtitle?: string;
  autoplay?: boolean;
  colors: any; // theme colors
};

export default function YoutubeSection({
  videoId,
  title = "▶ Video",
  subtitle,
  autoplay = false,
  colors,
}: Props) {
  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.labelRow}>
        {/* Tag */}
        <View style={styles.tag}>
          <Text style={styles.tagText}>{title}</Text>
        </View>

        {/* Subtitle */}
        <View style={{ flex: 1 }}>
          {!!subtitle && (
            <Text
              numberOfLines={2} // 👈 prevents long overflow
              style={[styles.subtitle, { color: colors.mutedText }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* ── Video ── */}
      <View
        style={[
          styles.videoWrapper,
          { borderColor: colors.border },
        ]}
      >
        <YoutubePlayer
          height={220}
          play={autoplay}
          videoId={videoId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },

  /* Header Row */
  labelRow: {
    flexDirection: "row",
    alignItems: "flex-start", // 👈 allows multi-line subtitle
    gap: 10,
    marginBottom: 10,
  },

  /* Tag */
  tag: {
    backgroundColor: "#FF000015",
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#FF000030",
  },

  tagText: {
    color: "#FF3B30",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Subtitle */
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    flexWrap: "wrap",
  },

  /* Video */
  videoWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "#000",
  },
});