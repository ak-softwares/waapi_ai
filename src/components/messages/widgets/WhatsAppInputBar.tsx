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

interface Props {
  message: string;
  setMessage: (v: string) => void;
  onSend: () => void;
  onEmojiPress?: () => void;
  inputRef?: any;
  onAttachPress?: () => void;
  onCameraPress?: () => void;
}

export default function WhatsAppInputBar({
  message,
  setMessage,
  onSend,
  onEmojiPress,
  inputRef,
  onAttachPress,
  onCameraPress,
}: Props) {

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);
  const hasText = message.trim().length > 0;

  return (
    <View style={styles.container}>

      <View style={styles.inputWrapper}>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            inputRef?.current?.focus();   // ✅ open keyboard
            onEmojiPress?.();             // optional (if you also show emoji picker)
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

        <TouchableOpacity onPress={onAttachPress} style={[styles.iconButton, { paddingBottom: 6, paddingRight: 10 }]}>          
          <Fontisto name="paperclip" size={19} color={colors.mutedText} />
        </TouchableOpacity>

        {!hasText 
          ? (
            <TouchableOpacity style={styles.iconButton} onPress={onCameraPress}>
              <Camera height={24} width={24} fill={colors.mutedText} />
            </TouchableOpacity>
          ) : undefined
        }
      </View>

      <TouchableOpacity
        style={styles.sendButton}
        onPress={onSend}
      >
        {hasText ? (
          <Send height={24} width={24} fill={colors.butttonTextSecondary} />
        ) : (
          <Mic height={24} width={24} fill={colors.butttonTextSecondary} />
        )}
      </TouchableOpacity>

    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({

    container: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 8,
      paddingVertical: 6,
      backgroundColor: "Transparent",
    },

    inputWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: colors.inputBackground,
      borderRadius: 25,
      paddingHorizontal: 8,
      paddingTop: 4,
      paddingBottom: 7,
      borderWidth: 1,
      borderColor: colors.border,
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
      paddingHorizontal: 6,
      paddingVertical: 4,
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