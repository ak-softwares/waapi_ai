import React, { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

import * as Clipboard from "expo-clipboard";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Chat } from "@/src/types/Chat";
import { Message, MessageType } from "@/src/types/Messages";
import { FormatRichText } from "@/src/utils/formater/formatRichText";
import { showToast } from "@/src/utils/toastHelper/toast";
import LocationMessage from "../renderMessages/LocationMessage";
import MediaMessage from "../renderMessages/MediaMessage";
import TemplateMessage from "../renderMessages/TemplateMessage";
import MessageMetaInfo from "./MessageMetaInfo";
// import { formatRichText } from "@/src/utiles/formatText/formatRichText"

interface Props {
  chat?: Chat,
  message: Message;

  isSelected?: boolean;
  isSelectionMode?: boolean;

  onPress?: () => void;
  onLongPress?: () => void;

  onDelete?: (messageId: string) => void;
  onReply?: () => void;
  onForward?: () => void;
  onInfo?: () => void;
  isPreviewMode?: boolean;
}

export default function MessageBubble({
  chat,
  message,

  onPress,
  onLongPress,

  isSelected,
  isSelectionMode,

  onDelete,
  onReply,
  onForward,
  onInfo,
  isPreviewMode,
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors, theme === "dark");

  const [menuVisible, setMenuVisible] = useState(false);

  const isTemplate =
    !!message?.template || message?.type === MessageType.TEMPLATE;
  const isMedia = !!message?.media || message?.type === MessageType.MEDIA;
  const isLocation =
    !!message?.location || message?.type === MessageType.LOCATION;

  const contactNumber = chat?.participants?.[0]?.number;

  const isMine = message.from !== contactNumber;

  const copyMessageText = async () => {
    if (!message?.message) return;

    await Clipboard.setStringAsync(message.message);

    showToast({ type: "success", message: "Message copied"});
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        { justifyContent: isMine ? "flex-end" : "flex-start"},
      ]}
    >
      {isSelected && (
        <View style={styles.selectionOverlay} />
      )}
      <View
        style={[
          styles.bubble,
          isMine ? styles.mine : styles.other,
          isPreviewMode ? { width: "100%", } : { maxWidth: "80%", },
        ]}
      >
        {/* Reply Context */}
        {message.context?.id && !isPreviewMode && (
          <View
            style={[
              styles.contextBox,
              {
                borderLeftColor: isMine ? "#06CF9C" : "#53BDEB",
              },
            ]}
          >
            <Text
              style={[
                styles.contextName,
                {
                  color: isMine ? "#04A37A" : "#4198BD",
                },
              ]}
            >
              {isMine ? "You" : chat?.participants?.[0]?.name}
            </Text>

            <Text style={styles.contextMessage} numberOfLines={1}>
              {message.context?.message}
            </Text>
          </View>
        )}

        {/* Message Content */}
        <View style={{ marginTop: 2 }}>
          {isTemplate 
            ? (<TemplateMessage message={message} template={message.template!} />) 
            : isMedia 
              ? (<MediaMessage message={message} />) 
              : isLocation 
                ? (<LocationMessage message={message} />) 
                : (<FormatRichText text={message.message} />)
          }

          {isMedia && !!message.media?.caption?.trim() && (
            <View style={styles.captionContainer}>
              <Text style={styles.captionText}>
                {message.media.caption}
              </Text>
            </View>
          )}

          {!isTemplate && (
            <View style={styles.metaInfo}>
              <MessageMetaInfo message={message} />
            </View>
          )}
        </View>
      </View>

      {/* SIMPLE MENU */}
      {/* {menuVisible && !isPreviewMode && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={onReply}>
            <Text style={styles.menuItem}>Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={copyMessageText}>
            <Text style={styles.menuItem}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onForward}>
            <Text style={styles.menuItem}>Forward</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onDelete?.(message._id!);
              setMenuVisible(false);
            }}
          >
            <Text style={[styles.menuItem, { color: "red" }]}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuVisible(false)}>
            <Text style={styles.menuItem}>Close</Text>
          </TouchableOpacity>
        </View>
      )} */}
    </Pressable>
  );
}

const getStyles = (colors: typeof lightColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      marginVertical: 4,
      paddingHorizontal: 10,
      position: "relative",
    },

    selectionOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: `${colors.primary}30`,
      // borderRadius: 8,
      // marginHorizontal: 10,
      zIndex: 2, 
    },

    bubble: {
      borderRadius: 10,
      zIndex: 1,
    },

    mine: {
      backgroundColor: colors.messageBubbleMine,
      borderTopRightRadius: 0,
    },

    other: {
      backgroundColor: colors.messageBubbleOther,
      borderTopLeftRadius: 0,
    },

    contextBox: {
      borderLeftWidth: 4,
      paddingLeft: 8,
      padding: 4,
      margin: 5,
      borderRadius: 6,
      backgroundColor: "rgba(185,182,182,0.1)",
    },

    captionContainer: {
      paddingHorizontal: 10,
      paddingTop: 6,
    },

    captionText: {
      fontSize: 14,
      color: colors.text,
    },

    contextName: {
      fontWeight: "600",
      fontSize: 13,
      color: colors.text,
    },

    contextMessage: {
      fontSize: 13,
      color: colors.secondaryText,
    },

    menu: {
      position: "absolute",
      right: 20,
      top: 0,
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },

    menuItem: {
      color: colors.text,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    metaInfo: {
      alignItems: "flex-end",
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
  });