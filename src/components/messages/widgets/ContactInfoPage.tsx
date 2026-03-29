import UserAvatar from "@/src/components/common/user/UserAvatar";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Chat, ChatType } from "@/src/types/Chat";
import { formatInternationalPhoneNumber } from "@/src/utiles/formater/formatPhone";
import { Edit2, Image as ImageIcon, Star, Trash2 } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  chat: Chat;
  onEditBroadcast?: () => void;
  onDelete?: (chat: Chat) => void;
};

export default function ContactInfoPage({
  chat,
  onEditBroadcast,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const isBroadcast = chat.type === ChatType.BROADCAST;
  const partner = chat.participants?.[0];

  const displayName = isBroadcast
    ? chat.chatName || "Broadcast"
    : partner?.name || formatInternationalPhoneNumber(String(partner?.number)).international || "Unknown";

  const userName = isBroadcast
    ? chat.chatName || "Broadcast"
    : partner?.name || partner?.number || "Unknown";

  const displayImage = isBroadcast ? chat.chatImage : partner?.imageUrl;
  const phoneNumber = isBroadcast ? "" : partner?.number;

    
  const handleEditBroadcast = () => {
    if (!isBroadcast) return;
    onEditBroadcast?.();
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileSection}>
        <UserAvatar
          name={userName}
          imageUrl={displayImage}
          size={108}
          isGroup={isBroadcast}
        />

        <Text style={styles.name}>{displayName}</Text>
        {!!phoneNumber && <Text style={styles.phone}>{formatInternationalPhoneNumber(String(phoneNumber)).international}</Text>}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionText}>Hey there! I am using WhatsApp.</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Media, links and docs</Text>
        <View style={styles.mediaRow}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.mediaTile}>
              <ImageIcon size={18} color={colors.mutedText} />
              <Text style={styles.mediaText}>Media {item}</Text>
            </View>
          ))}
        </View>
      </View>

      {isBroadcast && (
        <View style={styles.sectionCard}>
          <View style={styles.memberHeader}>
            <Text style={styles.sectionTitle}>
              Participants ({chat.participants.length})
            </Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditBroadcast}>
              <Edit2 size={16} color={colors.primary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {chat.participants.length === 0 ? (
            <Text style={styles.emptyParticipantsText}>No participants selected.</Text>
          ) : (
            chat.participants.slice(0, 5).map((member, index) => {
              const memberName =
                member.name ||
                formatInternationalPhoneNumber(String(member.number))
                  .international ||
                "Unknown";
              return (
                <View key={member.number || `${index}`} style={styles.memberItem}>
                  <UserAvatar
                    name={memberName}
                    imageUrl={member.imageUrl}
                    size={34}
                  />
                  <View style={styles.memberTextWrap}>
                    <Text numberOfLines={1} style={styles.memberName}>
                      {memberName}
                    </Text>
                    <Text style={styles.memberPhone}>
                      {formatInternationalPhoneNumber(String(member.number))
                        .international}
                    </Text>
                  </View>
                </View>
              );
            })
          )}  
        </View>
      )}

      <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.actionRow}>
          <Star size={18} color={colors.text} />
          <Text style={styles.actionText}>Starred Messages</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionRow} onPress={() => onDelete?.(chat)}>
          <Trash2 size={18} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Delete Chat</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingBottom: 24,
    },
    profileSection: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 24,
      paddingBottom: 20,
      gap: 6,
    },
    name: {
      marginTop: 10,
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
    },
    emptyParticipantsText: {
      color: colors.mutedText,
      fontSize: 14,
    },
    phone: {
      fontSize: 15,
      color: colors.mutedText,
    },
    sectionCard: {
      marginHorizontal: 12,
      marginTop: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
      gap: 12,
    },
    sectionTitle: {
      color: colors.mutedText,
      fontSize: 13,
      fontWeight: "600",
    },
    sectionText: {
      color: colors.text,
      fontSize: 15,
    },
    mediaRow: {
      flexDirection: "row",
      gap: 8,
    },
    mediaTile: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      minHeight: 74,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    mediaText: {
      fontSize: 12,
      color: colors.mutedText,
    },
    memberHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    editText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },
    memberItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    memberTextWrap: {
      flex: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      paddingBottom: 9,
    },
    memberName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    memberPhone: {
      color: colors.mutedText,
      fontSize: 13,
      marginTop: 2,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 4,
    },
    actionText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "500",
    },
  });
