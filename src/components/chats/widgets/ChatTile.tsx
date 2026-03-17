import UserAvatar from "@/src/components/common/UserAvatar";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Chat, ChatType } from "@/src/types/Chat";
import { formatInternationalPhoneNumber } from "@/src/utiles/formater/formatPhone";
import { formatMessageDateOrTime } from "@/src/utiles/formater/formatTime";
import { Check } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  chat: Chat;
  onPress: () => void;
  onLongPress?: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
};

export default function ChatTile({
  chat,
  onPress,
  onLongPress,
  isSelectionMode = false,
  isSelected = false,
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const isUnread = (chat.unreadCount ?? 0) > 0;
  const isBroadcast = chat.type === ChatType.BROADCAST;
  const partner = chat.participants[0];

  const displayName = isBroadcast
    ? chat.chatName || ChatType.BROADCAST
    : partner?.name || formatInternationalPhoneNumber(String(partner?.number)).international || "Unknown";

  const userName = isBroadcast
    ? chat.chatName || ChatType.BROADCAST
    : partner?.name || partner?.number || "Unknown";

  const displayImage = isBroadcast ? chat?.chatImage : partner?.imageUrl;

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={250}
    >
      <View style={styles.avatar}>
        <UserAvatar
          name={userName}
          imageUrl={displayImage}
          size={45}
          isGroup={isBroadcast}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text
            style={[styles.name, isUnread && { color: colors.text, fontWeight: "700" }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          <Text style={[styles.time, isUnread && { color: colors.primary }]}>
            {formatMessageDateOrTime(chat.lastMessageAt)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text
            style={[styles.message, isUnread && { color: colors.text }]}
            numberOfLines={1}
          >
            {chat.lastMessage || "No messages yet"}
          </Text>

          {isUnread && !isSelectionMode && (
            <View style={styles.unread}>
              <Text style={styles.unreadText}>
                {(chat.unreadCount ?? 0) > 99 ? "99+" : chat.unreadCount}
              </Text>
            </View>
          )}

          {isSelectionMode && (
            <View style={[styles.selectionDot, isSelected && styles.selectionDotActive]}>
              {isSelected && <Check size={14} color="#fff" />}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      paddingVertical: 15,
      paddingHorizontal: 5,
      backgroundColor: colors.background,
      borderRadius: 10,
    },
    selectedContainer: {
      backgroundColor: `${colors.primary}1A`,
    },
    avatar: {
      marginRight: 10,
    },
    content: {
      flex: 1,
      // paddingBottom: 10,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    name: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
      marginRight: 10,
    },
    time: {
      fontSize: 12,
      color: colors.mutedText,
    },
    message: {
      fontSize: 14,
      color: colors.mutedText,
      flex: 1,
      marginTop: 2,
      marginRight: 10,
    },
    unread: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      minWidth: 22,
      height: 22,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    unreadText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },
    selectionDot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    selectionDotActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });