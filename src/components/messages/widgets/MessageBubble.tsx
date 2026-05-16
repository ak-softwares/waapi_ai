import React, { useCallback, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Chat } from "@/src/types/Chat";
import { Message, MessageType } from "@/src/types/Messages";
import { FormatRichText } from "@/src/utils/formater/formatRichText";
import LocationMessage from "../renderMessages/LocationMessage";
import MediaMessage from "../renderMessages/MediaMessage";
import TemplateMessage from "../renderMessages/TemplateMessage";
import MessageMetaInfo from "./MessageMetaInfo";

import { Reply } from "lucide-react-native";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface Props {
  chat?: Chat;
  message: Message;
  isSelected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onReply?: (message: Message) => void;
  isPreviewMode?: boolean;
}

// ─── Reply icon that animates in as you drag ──────────────────────────────────
function LeftAction({ progress }: { progress: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.5, 1]) }],
  }));

  return (
    <Animated.View
      style={[
        {
          justifyContent: "center",
          alignItems: "flex-start",
          paddingLeft: 16,
          width: 60,
        },
        animatedStyle,
      ]}
    >
      <Reply size={22} color="#8696A0" />
    </Animated.View>
  );
}

export default function MessageBubble({
  chat,
  message,
  onPress,
  onLongPress,
  isSelected,
  onReply,
  isPreviewMode,
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors, theme === "dark");

  const isTemplate = !!message?.template || message?.type === MessageType.TEMPLATE;
  const isMedia    = !!message?.media    || message?.type === MessageType.MEDIA;
  const isLocation = !!message?.location || message?.type === MessageType.LOCATION;

  const contactNumber = chat?.participants?.[0]?.number;
  const isMine = message.from !== contactNumber;

  // ✅ SwipeableMethods is the correct ref type for ReanimatedSwipeable
  const swipeableRef = useRef<SwipeableMethods>(null);

  const renderLeftActions = useCallback(
    (progress: SharedValue<number>) => <LeftAction progress={progress} />,
    []
  );

  const handleSwipeOpen = useCallback(
    (direction: "left" | "right") => {
      if (direction === "right") {
        onReply?.(message);
        // Snap back immediately — same feel as WhatsApp
        swipeableRef.current?.close();
      }
    },
    [message, onReply]
  );

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={40}
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={handleSwipeOpen}
      overshootLeft={false}
      // Disable swipe in preview mode (e.g. template preview screen)
      enabled={!isPreviewMode}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.container,
          { justifyContent: isMine ? "flex-end" : "flex-start" },
        ]}
      >
        {isSelected && <View style={styles.selectionOverlay} />}

        <View
          style={[
            styles.bubble,
            isMine ? styles.mine : styles.other,
            isPreviewMode ? { width: "100%" } : { maxWidth: "80%" },
          ]}
        >
          {/* Reply Context */}
          {message.context?.id && !isPreviewMode && (
            <View
              style={[
                styles.contextBox,
                { borderLeftColor: isMine ? "#06CF9C" : "#53BDEB" },
              ]}
            >
              <Text
                style={[
                  styles.contextName,
                  { color: isMine ? "#04A37A" : "#4198BD" },
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
            {isTemplate ? (
              <TemplateMessage message={message} template={message.template!} />
            ) : isMedia ? (
              <MediaMessage message={message} />
            ) : isLocation ? (
              <LocationMessage message={message} />
            ) : (
              <FormatRichText text={message.message} />
            )}

            {isMedia && !!message.media?.caption?.trim() && (
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>{message.media.caption}</Text>
              </View>
            )}

            {!isTemplate && (
              <View style={styles.metaInfo}>
                <MessageMetaInfo message={message} />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </ReanimatedSwipeable>
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
    metaInfo: {
      alignItems: "flex-end",
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
  });