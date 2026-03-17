import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import AppMenu from "@/src/components/common/AppMenu";
import MessageBubble from "@/src/components/messages/widgets/MessageBubble";
import WhatsAppInputBar from "@/src/components/messages/widgets/WhatsAppInputBar";

import { useTheme } from "@/src/context/ThemeContext";
import { useMessages } from "@/src/hooks/messages/useMessages";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Message, MessageType } from "@/src/types/Messages";

import EmojiSelector from "react-native-emoji-selector";

import UserAvatar from "@/src/components/common/UserAvatar";
import { ChatType } from "@/src/types/Chat";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MoreVertical, Search, Trash2, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Copy from "@/assets/menuIcons/copy.svg";
import Delete from "@/assets/menuIcons/delete.svg";
import Forward from "@/assets/menuIcons/forward.svg";
import Reply from "@/assets/menuIcons/reply.svg";
import MessageContactInfoCard from "@/src/components/messages/widgets/MessageContactInfoCard";
import { formatInternationalPhoneNumber } from "@/src/utiles/formater/formatPhone";

const WHATSAPP_BG = require("@/assets/whatsapp/message-bg.png");

type MessageParams = {
  chatId: string;
  chatData?: string;
};

export default function MessageScreen() {

  const { chatId, chatData } = useLocalSearchParams<MessageParams>();
  const chat = chatData ? JSON.parse(chatData) : null;

  const inputRef = useRef<TextInput>(null);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors, theme === "dark");

  const { messages, onSend, loading } = useMessages({ chatId });

  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const selectedIds = new Set(selectedMessages.map(m => m._id));

  const toggleMessageSelection = (msg: Message) => {
    setSelectedMessages((prev) =>
      prev.some((m) => m._id === msg._id)
        ? prev.filter((m) => m._id !== msg._id)
        : [...prev, msg]
    );
  };

  const clearSelection = () => {
    setSelectedMessages([]);
    setIsSelectionMode(false);
  };

  const handleDeleteSelected = () => {
    const ids = selectedMessages.map(m => m._id);
    console.log("Delete messages:", ids);
    clearSelection();
  };

  const sendMessageHandler = () => {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    onSend({
      messagePayload: {
        message: cleanMessage,
        chatId,
        messageType: MessageType.TEXT,
        participants: chat.participants,
      },
    });

    setMessage("");
  };

  const toggleEmoji = () => {
    if (showEmoji) {
      setShowEmoji(false);
      inputRef.current?.focus();
    } else {
      Keyboard.dismiss();
      setShowEmoji(true);
    }
  };

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      setShowEmoji(false);
    });

    return () => show.remove();
  }, []);

  const handleOpenContactInfo = () => { 
    if (!chat) return; 
    router.push({ pathname: "/(dashboard)/messages/contactInfo", 
      params: { 
        chat: JSON.stringify(chat)
      },
    });
  };

    const handleCallContact = async () => {
    const number = chat?.participants?.[0]?.number;
    if (!number) return;

    await Linking.openURL(`tel:${number}`);
  };

  const handleSaveContact = () => {
    // TODO: wire with native contact save flow
    console.log("Save contact:", chat?.participants?.[0]?.number);
  };

  if (!chatId) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Select a chat</Text>
      </View>
    );
  }

  const isBroadcast = chat.type === ChatType.BROADCAST;
  const partner = chat.participants[0];

  const displayName = isBroadcast
    ? chat.chatName || ChatType.BROADCAST
    : partner?.name || formatInternationalPhoneNumber(String(partner?.number)).international || "Unknown";

  const userName =
    isBroadcast
      ? chat.chatName || ChatType.BROADCAST
      : partner?.name || partner?.number || "Unknown";

  const displayImage =
    isBroadcast ? chat?.chatImage : partner?.imageUrl;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () =>
            isSelectionMode ? (
              <View>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {`Selected (${selectedMessages.length})`}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleOpenContactInfo}
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <UserAvatar
                  name={userName}
                  imageUrl={displayImage}
                  size={35}
                  isGroup={isBroadcast}
                />

                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {displayName}
                </Text>
              </TouchableOpacity>
            ),

          headerLeft: () => (
            <View style={{ paddingRight: 10 }}>
              {isSelectionMode
                ?
                <TouchableOpacity onPress={clearSelection}>
                  <X size={22} color={colors.text} />
                </TouchableOpacity>
                :
                <TouchableOpacity onPress={() => router.back()}>
                  <ArrowLeft size={22} color={colors.text} />
                </TouchableOpacity>
              }
            </View>
          ),

          headerRight: () => (
            <View>
              {isSelectionMode ? (
                <View style={styles.selectionActionsRight}>
                  <TouchableOpacity onPress={handleDeleteSelected}>
                    <Reply height={20} width={20} fill={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteSelected}>
                    <Delete height={20} width={20} fill={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteSelected}>
                    <Copy height={20} width={20} fill={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteSelected}>
                    <Forward height={20} width={20} fill={colors.text} />
                  </TouchableOpacity>
                  <AppMenu
                    trigger={<MoreVertical size={22} color={colors.text} />}
                    items={[
                      {
                        label: "Delete All",
                        icon: <Trash2 size={16} color={colors.error} />,
                        onPress: () => { },
                      },
                    ]}
                  />
                </View>
              ) : (
                <View style={styles.selectionActionsRight}>
                  <TouchableOpacity>
                    <Search size={20} color={colors.text} />
                  </TouchableOpacity>

                  <AppMenu
                    trigger={<MoreVertical size={22} color={colors.text} />}
                    items={[
                      {
                        label: "Delete All",
                        icon: <Trash2 size={16} color={colors.error} />,
                        onPress: () => { },
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ImageBackground
          source={WHATSAPP_BG}
          style={styles.messagesArea}
          imageStyle={styles.bgImage}
        >
          {loading && (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}

          {/* <MessageContactInfoCard
            chat={chat}
            onCall={handleCallContact}
          /> */}

          <FlatList
            data={messages}
            inverted
            keyExtractor={(item) =>
              item._id || `${item.createdAt}-${item.message}`
            }
            ListFooterComponent={
              <MessageContactInfoCard
                chat={chat}
                onCall={handleCallContact}
              />
            }
            renderItem={({ item }) => (
              <MessageBubble
                chat={chat}
                message={item}
                isSelected={selectedIds.has(item._id)}
                isSelectionMode={isSelectionMode}
                onPress={() =>
                  isSelectionMode
                    ? toggleMessageSelection(item)
                    : null
                }
                onLongPress={() => {
                  setIsSelectionMode(true);
                  toggleMessageSelection(item);
                }}
              />
            )}
            contentContainerStyle={styles.messagesContent}
          />

          <SafeAreaView edges={["bottom"]}>
            <WhatsAppInputBar
              inputRef={inputRef}
              message={message}
              setMessage={setMessage}
              onSend={sendMessageHandler}
              onEmojiPress={toggleEmoji}
            />
          </SafeAreaView>
        </ImageBackground>

        {showEmoji && (
          <EmojiSelector
            onEmojiSelected={(emoji) =>
              setMessage((prev) => prev + emoji)
            }
            showSearchBar={false}
            showTabs
            columns={8}
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const getStyles = (colors: typeof lightColors, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    emptyText: { color: colors.text },

    selectionActionsRight: {
      flexDirection: "row",
      gap: 15,
    },

    messagesArea: { flex: 1 },

    bgImage: {
      tintColor: isDark ? undefined : "#222",
      opacity: isDark ? 0.15 : 0.08,
    },

    loaderWrap: {
      position: "absolute",
      top: 10,
      width: "100%",
      alignItems: "center",
      zIndex: 1,
    },

    messagesContent: {
      paddingVertical: 8,
      flexGrow: 1,
    },
  });