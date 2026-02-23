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
  View,
} from "react-native";

type Props = {
  chat: Chat;
  onPress: () => void;
};

export default function ChatTile({ chat, onPress }: Props) {
  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }
  const isUnread = (chat.unreadCount ?? 0) > 0;
  const isBroadcast = chat.type === ChatType.BROADCAST;
  const partner = chat.participants[0];
  const displayName = isBroadcast
    ? chat.chatName || ChatType.BROADCAST
    : partner?.name || formatPhone(String(partner?.number)) || "Unknown";

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
          <Users2 style={styles.avatarImage} size={20} color="#9CA3AF" />
        ) : (
          <User2 style={styles.avatarImage} size={20} color="#9CA3AF" />
        )}
      </View>

      {/* Center Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>

          <Text style={[styles.time, isUnread && styles.unreadTextColor]}>
            {formatMessageDateOrTime(chat.lastMessageAt)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text
            style={ styles.message }
            numberOfLines={1}
          >
            {chat.lastMessage || "No messages yet"}
          </Text>

          {isUnread && (
            <View style={styles.unread}>
              <Text style={styles.unreadText}>
                {(chat.unreadCount ?? 0) > 99 ? "99+" : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
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
    color: "#111",
    flex: 1,
    marginRight: 10,
  },

  time: {
    fontSize: 12,
    color: "#999",
  },

  message: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginTop: 2,
    marginRight: 10,
  },

  unread: {
    backgroundColor: "#1DAA57",
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
  unreadTextColor: {
    color: "#1DAA57", // WhatsApp green
    fontWeight: "600",
  },

  unreadCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  avatarImage: {
    width: 30,
    height: 30,
    borderRadius: 26,
  },

});
