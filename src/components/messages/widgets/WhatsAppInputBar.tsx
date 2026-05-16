import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import Camera from "@/assets/messageInput/camera.svg";
import Emogi from "@/assets/messageInput/emoji.svg";
import Mic from "@/assets/messageInput/mic.svg";
import Send from "@/assets/messageInput/send-message.svg";

import { Fontisto } from "@expo/vector-icons";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Message } from "@/src/types/Messages";
import { formatInternationalPhoneNumber } from "@/src/utils/formater/formatPhone";
import { X } from "lucide-react-native";
import { Text } from "react-native";

interface Props {
  message: string;
  setMessage: (v: string) => void;
  onSend: () => void;
  onEmojiPress?: () => void;
  inputRef?: any;
  onAttachPress?: () => void;
  onCameraPress?: () => void;
  messageContext?: Message | null;
  onClearReply?: () => void;
}

export default function WhatsAppInputBar({
  message,
  setMessage,
  onSend,
  onEmojiPress,
  inputRef,
  onAttachPress,
  onCameraPress,
  messageContext,
  onClearReply,
}: Props) {

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);
  const hasText = message.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>

        {/* ─── Reply Preview Strip ─────────────────────────────────── */}
        {messageContext && (
          <View style={styles.replyPreview}>
            <View style={styles.replyBar} />
            <View style={styles.replyContent}>
              <Text style={styles.replyName} numberOfLines={1}>
                {formatInternationalPhoneNumber(String(messageContext.from)).international ?? "You"}
              </Text>
              <Text style={styles.replyText} numberOfLines={2}>
                {messageContext.message ?? "Media"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClearReply} hitSlop={10}>
              <X size={16} color={colors.mutedText} />
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Input Row (icons stay in their own row) ──────────────── */}
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              inputRef?.current?.focus();
              onEmojiPress?.();
            }}
          >
            <Emogi height={24} width={24} fill={colors.mutedText} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            placeholderTextColor={colors.mutedText}
            multiline
            style={styles.input}
          />

          <TouchableOpacity
            onPress={onAttachPress}
            style={styles.iconButton}
          >
            <Fontisto name="paperclip" size={19} color={colors.mutedText} />
          </TouchableOpacity>

          {!hasText && (
            <TouchableOpacity style={styles.iconButton} onPress={onCameraPress}>
              <Camera height={24} width={24} fill={colors.mutedText} />
            </TouchableOpacity>
          )}
        </View>

      </View>

      <TouchableOpacity style={styles.sendButton} onPress={onSend}>
        {hasText
          ? <Send height={24} width={24} fill={colors.butttonTextSecondary} />
          : <Mic  height={24} width={24} fill={colors.butttonTextSecondary} />
        }
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-end",          // send button hugs the bottom of the pill
      paddingHorizontal: 8,
      paddingVertical: 6,
      backgroundColor: "transparent",
    },

    inputWrapper: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      paddingBottom: 4,                // breathing room under the input row
    },

    // ─── Reply Preview ────────────────────────────────────────────────────
    replyPreview: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 12,
      marginHorizontal: 10,
      marginTop: 8,
      marginBottom: 4,
      paddingVertical: 6,
      paddingRight: 10,
      gap: 8,
    },
    replyBar: {
      width: 3,
      alignSelf: "stretch",
      borderRadius: 2,
      backgroundColor: colors.primary,
      marginLeft: 6,
    },
    replyContent: {
      flex: 1,
    },
    replyName: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 1,
    },
    replyText: {
      fontSize: 12,
      color: colors.mutedText,
    },

    // ─── Input Row ────────────────────────────────────────────────────────
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",          // icons pin to bottom when text wraps
      paddingHorizontal: 4,
      paddingTop: 2,
    },

    input: {
      flex: 1,
      maxHeight: 120,
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: 16,
      color: colors.text,
    },

    iconButton: {
      padding: 6,                      // uniform tap target on all icons
      justifyContent: "center",
      alignItems: "center",
    },

    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 6,
    },
  });