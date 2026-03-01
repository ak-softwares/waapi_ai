import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Chat, ChatType } from "@/src/types/Chat";
import { formatMessageDateOrTime } from "@/src/utiles/formatTime/formatTime";
import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { User2, Users2 } from "lucide-react-native";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type Props = {
  chat: Chat;
  onPress: () => void;
};

export default function ChatTile({ chat, onPress }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const formatPhone = (
    number: string,
    defaultCountry: CountryCode = "IN"
  ) => {
    const phoneNumber = parsePhoneNumberFromString(
      number,
      defaultCountry
    );
    return phoneNumber
      ? phoneNumber.formatInternational()
      : number;
  };

  const isUnread = (chat.unreadCount ?? 0) > 0;
  const isBroadcast = chat.type === ChatType.BROADCAST;

  const partner = chat.participants[0];

  const displayName = isBroadcast
    ? chat.chatName || ChatType.BROADCAST
    : partner?.name ||
      formatPhone(String(partner?.number)) ||
      "Unknown";

  const displayImage = isBroadcast
    ? chat?.chatImage
    : partner?.imageUrl;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Avatar */}
      <View style={styles.avatar}>
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={styles.avatarImage}
          />
        ) : isBroadcast ? (
          <Users2 size={20} color={colors.mutedText} />
        ) : (
          <User2 size={20} color={colors.mutedText} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text
            style={[
              styles.name,
              isUnread && { color: colors.text, fontWeight: "700" },
            ]}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          <Text
            style={[
              styles.time,
              isUnread && { color: colors.primary },
            ]}
          >
            {formatMessageDateOrTime(chat.lastMessageAt)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text
            style={[
              styles.message,
              isUnread && { color: colors.text },
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage || "No messages yet"}
          </Text>

          {isUnread && (
            <View style={styles.unread}>
              <Text style={styles.unreadText}>
                {(chat.unreadCount ?? 0) > 99
                  ? "99+"
                  : chat.unreadCount}
              </Text>
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
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
    },

    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },

    avatarImage: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },

    content: {
      flex: 1,
      paddingBottom: 10,
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
  });