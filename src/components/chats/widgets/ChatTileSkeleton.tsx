import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function ChatTileSkeleton() {
  return (
    <MotiView style={styles.container}>
      {/* Avatar */}
      <Skeleton radius="round" width={52} height={52} />

      <View style={{ flex: 1, marginLeft: 12 }}>
        {/* Name + Time */}
        <View style={styles.row}>
          <Skeleton width={140} height={14} />
          <Skeleton width={50} height={13} />
        </View>

        {/* Message */}
        <Skeleton width="80%" height={12} />
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
