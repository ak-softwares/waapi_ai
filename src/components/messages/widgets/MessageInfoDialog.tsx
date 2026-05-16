import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Message, MessageStatus } from "@/src/types/Messages";
import { formatFullDateTime } from "@/src/utils/formater/formatTime";

type Props = {
  visible: boolean;
  onClose: () => void;
  messages: Message[];
};

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <View style={stylesRow.row}>
    <Text style={stylesRow.label}>{label}</Text>
    <Text style={stylesRow.value}>{value ? formatFullDateTime(value) : "—"}</Text>
  </View>
);

export default function MessageInfoDialog({ visible, onClose, messages }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Message Info</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.description}>
            Delivery and read report details ({messages.length} selected)
          </Text>

          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={styles.contentWrap}>
            {messages.map((msg, index) => {
              const isFailed = msg.status === MessageStatus.Failed || Boolean(msg.failedAt);
              const isReceivedOnly = msg.status === MessageStatus.Received;

              return (
                <View key={msg._id || `${msg.createdAt}-${index}`} style={styles.block}>
                  <View style={styles.blockHeader}>
                    <Text style={styles.preview} numberOfLines={2}>
                      {msg.message || "No text content"}
                    </Text>
                    <Text style={styles.status}>{msg.status}</Text>
                  </View>

                  {isFailed ? (
                    <InfoRow label="Failed" value={msg.failedAt || msg.createdAt} />
                  ) : isReceivedOnly ? (
                    <InfoRow label="Received" value={msg.createdAt} />
                  ) : (
                    <>
                      <InfoRow label="Sent" value={msg.sentAt} />
                      <InfoRow label="Delivered" value={msg.deliveredAt} />
                      <InfoRow label="Read" value={msg.readAt} />
                    </>
                  )}

                  {msg.errorMessage ? (
                    <Text style={styles.error}>Error: {msg.errorMessage}</Text>
                  ) : null}

                  {index < messages.length - 1 && <View style={styles.separator} />}
                </View>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const stylesRow = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 6,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
  },
});

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      padding: 16,
    },
    card: {
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    title: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
    },
    close: {
      color: colors.primary,
      fontWeight: "600",
    },
    description: {
      color: colors.secondaryText,
      marginBottom: 10,
      fontSize: 13,
    },
    contentWrap: {
      gap: 10,
    },
    block: {
      paddingBottom: 8,
    },
    blockHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    preview: {
      color: colors.text,
      fontSize: 13,
      flex: 1,
    },
    status: {
      color: colors.secondaryText,
      fontSize: 12,
      textTransform: "capitalize",
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginTop: 10,
    },
    error: {
      color: colors.warning,
      marginTop: 8,
      fontSize: 12,
    },
  });
