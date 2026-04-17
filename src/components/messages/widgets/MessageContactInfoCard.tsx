import UserAvatar from "@/src/components/common/user/UserAvatar";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Chat, ChatType } from "@/src/types/Chat";
import { getCountryName } from "@/src/utils/formater/country";
import { formatInternationalPhoneNumber } from "@/src/utils/formater/formatPhone";
import { getCountryCallingCode } from "libphonenumber-js";
import { Ban, Phone } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


type Props = {
  chat: Chat;
  onCall?: () => void;
  onProfile?: () => void;
};

export default function MessageContactInfoCard({ chat, onCall, onProfile }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const isBroadcast = chat.type === ChatType.BROADCAST;
  const partner = chat.participants?.[0];

  const formattedPhone = formatInternationalPhoneNumber(String(partner?.number ?? ""));
  const countryCode = formattedPhone.country;

  const countryName = countryCode
    ? getCountryName(countryCode)
    : "Unknown";

  const countryLabel = countryCode
    ? `${countryName} (+${getCountryCallingCode(countryCode)})`
    : "Unknown";

  const displayName = isBroadcast
    ? chat.chatName || "Broadcast"
    : partner?.name || formatInternationalPhoneNumber(String(partner?.number ?? "")).international || "Unknown";

  const userName = isBroadcast
    ? chat.chatName || "Broadcast"
    : partner?.name || partner?.number || "Unknown";

  const displayImage = isBroadcast ? chat.chatImage : partner?.imageUrl;
  const phoneNumber = isBroadcast ? "" : partner?.number || "";

  return (
    <View style={styles.card}>
      <UserAvatar
        name={userName}
        imageUrl={displayImage}
        size={72}
        isGroup={isBroadcast}
      />

      <Text style={styles.name}>{displayName}</Text>

      {!!phoneNumber && formattedPhone &&(
        <Text style={styles.phone}>{formattedPhone.international}</Text>
      )}

      {!isBroadcast && (
        <Text style={styles.country}>{countryLabel}</Text>
      )}

      {!isBroadcast && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.callButton} onPress={onCall}>
            <Phone size={18} color={colors.primary} />
            <Text style={styles.callText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.callButton} onPress={onProfile}>
            <Ban size={18} color={colors.primary} />
            <Text style={styles.profileText}>Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    card: {
      marginHorizontal: 30,
      marginTop: 20,
      marginBottom: 100,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      paddingVertical: 28,
      paddingHorizontal: 20,
      alignItems: "center",
    },

    name: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 12,
      textAlign: "center",
    },

    phone: {
      color: colors.text,
      fontSize: 14,
      marginTop: 4,
      textAlign: "center",
    },

    country: {
      color: colors.mutedText,
      fontSize: 13,
      marginTop: 4,
      textAlign: "center",
    },

    actionsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
      width: "100%",
      justifyContent: "center",
    },

    callButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      paddingVertical: 10,
      paddingHorizontal: 18,
      minWidth: 120,
    },

    callText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },

    profileText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },
  });