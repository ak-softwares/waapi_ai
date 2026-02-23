import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import * as Clipboard from "expo-clipboard";

import { useChatStore } from "@/src/store/chatStore";
import { ChatParticipant } from "@/src/types/Chat";
import { Message, MessageType } from "@/src/types/Messages";
import { showToast } from "@/src/utiles/toastHelper/toast";
import LocationMessage from "../renderMessages/LocationMessage";
import MediaMessage from "../renderMessages/MediaMessage";
import TemplateMessage from "../renderMessages/TemplateMessage";
import MessageMetaInfo from "./MessageMetaInfo";
// import { formatRichText } from "@/src/utiles/formatText/formatRichText"

interface Props {
  message: Message;
  onDelete?: (messageId: string) => void;
  onReply?: () => void;
  onForward?: () => void;
  onInfo?: () => void;
  isPreviewMode?: boolean;
}

export default function MessageBubble({
  message,
  onDelete,
  onReply,
  onForward,
  onInfo,
  isPreviewMode,
}: Props) {
  const activeChat = useChatStore((s) => s.activeChat);
  const [menuVisible, setMenuVisible] = useState(false);

  const isTemplate =
    !!message?.template || message?.type === MessageType.TEMPLATE;
  const isMedia = !!message?.media || message?.type === MessageType.MEDIA;
  const isLocation =
    !!message?.location || message?.type === MessageType.LOCATION;

  const isMine = !activeChat?.participants?.some(
    (p: ChatParticipant) => p.number === message.from
  );

  const isMineContext =
    !!message.context?.from &&
    !!activeChat?.participants?.length &&
    message.context.from !== activeChat.participants[0].number;

  const copyMessageText = async () => {
    if (!message?.message) return;

    await Clipboard.setStringAsync(message.message);

    showToast({ type: "success", message: "Message copied"});
  };

  return (
    <Pressable
      onLongPress={() => setMenuVisible(true)}
      style={[
        styles.container,
        { justifyContent: isMine ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMine ? styles.mine : styles.other,
        ]}
      >
        {/* Reply Context */}
        {message.context?.id && !isPreviewMode && (
          <View
            style={[
              styles.contextBox,
              {
                borderLeftColor: isMineContext ? "#06CF9C" : "#53BDEB",
              },
            ]}
          >
            <Text
              style={[
                styles.contextName,
                {
                  color: isMineContext ? "#04A37A" : "#4198BD",
                },
              ]}
            >
              {isMineContext ? "You" : activeChat?.participants?.[0]?.name}
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
            <Text style={styles.text}>{message.message}</Text>
          )}

          {!isTemplate && (
            <View style={{ alignItems: "flex-end" }}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 10,
  },

  bubble: {
    maxWidth: "80%",
    borderRadius: 10,
    padding: 10,
  },

  mine: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 0,
  },

  other: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
  },

  text: {
    fontSize: 15,
    color: "#111",
  },

  contextBox: {
    borderLeftWidth: 4,
    paddingLeft: 8,
    marginBottom: 6,
  },

  contextName: {
    fontWeight: "600",
    fontSize: 13,
  },

  contextMessage: {
    fontSize: 13,
    color: "#555",
  },

  menu: {
    position: "absolute",
    right: 20,
    top: 0,
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 8,
  },

  menuItem: {
    color: "white",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});