import AudioIcon from "@/assets/messageIcons/audio.svg";
import CameraIcon from "@/assets/messageIcons/camera.svg";
import DocumentIcon from "@/assets/messageIcons/document-icon.svg";
import GalleryIcon from "@/assets/messageIcons/image.svg";
import LocationIcon from "@/assets/messageIcons/location-icon.svg";
import Template from "@/assets/messageIcons/template-icon.svg";
import AppMenu from "@/src/components/common/AppMenu";
import MessageBubble from "@/src/components/messages/widgets/MessageBubble";
import WhatsAppInputBar from "@/src/components/messages/widgets/WhatsAppInputBar";
import { useTheme } from "@/src/context/ThemeContext";
import { useMessages } from "@/src/hooks/messages/useMessages";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Message, MessagePayload, MessageType } from "@/src/types/Messages";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ImageBackground,
  LayoutChangeEvent,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import UserAvatar from "@/src/components/common/user/UserAvatar";
import { ChatType } from "@/src/types/Chat";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MoreVertical, Search, Trash2, X } from "lucide-react-native";

import Copy from "@/assets/menuIcons/copy.svg";
import Delete from "@/assets/menuIcons/delete.svg";
import Download from "@/assets/menuIcons/download.svg";
import Forward from "@/assets/menuIcons/forward.svg";
import Info from "@/assets/menuIcons/info.svg";
import Reply from "@/assets/menuIcons/reply.svg";
import ConfirmSheet from "@/src/components/common/ConfirmSheet";
import AttachmentSheet from "@/src/components/messages/widgets/AttachmentSheet";
import MessageBubbleShimmer from "@/src/components/messages/widgets/MessageBubbleShimmer";
import MessageContactInfoCard from "@/src/components/messages/widgets/MessageContactInfoCard";
import MessageInfoDialog from "@/src/components/messages/widgets/MessageInfoDialog";
import { useDeleteMessages } from "@/src/hooks/messages/useDeleteMessages";
import { useMedia } from "@/src/hooks/messages/useMedia";
import { useSendMessage } from "@/src/hooks/messages/useSendMessage";
import { MediaSourceType } from "@/src/utils/enums/mediaTypes";
import { TemplateComponentType } from "@/src/utils/enums/template";
import { formatInternationalPhoneNumber } from "@/src/utils/formater/formatPhone";
import { showToast } from "@/src/utils/toastHelper/toast";
import { KeyboardChatScrollView, KeyboardGestureArea, KeyboardStickyView } from "react-native-keyboard-controller";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const WHATSAPP_BG = require("@/assets/whatsapp/message-bg.png");

type MessageParams = {
  chatId: string;
  chatData?: string;
};

export default function MessageScreen() {

  const { chatId, chatData } = useLocalSearchParams<MessageParams>();
  const chat = chatData ? JSON.parse(chatData) : null;

  const ref = useRef<ScrollView>(null);
  const textRef = useRef("");
  const inputRef = useRef<TextInput>(null);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors, theme === "dark");

  const { messages, setMessages, loading, loadMore, hasMore, loadingMore } = useMessages({ chatId });
  const { isSending, sendMessage } = useSendMessage();
  const [message, setMessage] = useState("");
  const [messageContext, setMessageContext] = useState<Message | null>(null);

  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  // ─── Delete confirmation state ────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Holds the IDs that are waiting for the user to confirm deletion
  const pendingDeleteIdsRef = useRef<string[]>([]);

  const extraContentPadding = useSharedValue(0);
  const { bottom } = useSafeAreaInsets();

  // No onDeleted callback needed here — we handle UI update optimistically
  const { deleteMessage, deleteMessagesBulk, isDeleting } = useDeleteMessages();

  const { downloadMedia, downloading } = useMedia();

  const [showMessageInfo, setShowMessageInfo] = useState(false);

  const stickyViewOffset = useMemo(
    () => ({ opened: bottom }),
    [bottom],
  );

  const ChatScrollView = React.forwardRef((props: any, ref: any) => {
    const { bottom } = useSafeAreaInsets();

    return (
      <KeyboardChatScrollView
        ref={ref}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="interactive"
        offset={bottom - 8}
        {...props}
      />
    );
  });

  const renderScrollComponent = useCallback(
    (props: any) => (
      <ChatScrollView
        {...props}
        extraContentPadding={extraContentPadding}
      />
    ),
    []
  );

  const getMessageTextForCopy = (selectedMessage: Message) => {
    if (selectedMessage?.type === MessageType.TEMPLATE || selectedMessage?.template) {
      const bodyComponent = selectedMessage.template?.components?.find(
        (component) => component.type === TemplateComponentType.BODY
      );

      return bodyComponent && "text" in bodyComponent
        ? bodyComponent.text?.trim() ?? ""
        : "";
    }

    return selectedMessage.message?.trim() ?? "";
  };

  const handleCopySelected = async () => {
    if (selectedMessages.length !== 1) {
      showToast({ type: "error", message: "Select exactly one message to copy." });
      return;
    }

    const textToCopy = getMessageTextForCopy(selectedMessages[0]);

    if (!textToCopy) {
      showToast({ type: "error", message: "Nothing to copy from selected message." });
      return;
    }

    await Clipboard.setStringAsync(textToCopy);
    showToast({ type: "success", message: "Message copied" });
    clearSelection();
  };

  const onInputLayout = useCallback((e: LayoutChangeEvent) => {
    extraContentPadding.value = withTiming(
      Math.max(e.nativeEvent.layout.height - 42, 0),
      { duration: 250 }
    );
  }, []);

  const selectedIds = new Set(selectedMessages.map(m => m._id));

  const isSingleMediaSelected =
    selectedMessages.length === 1 &&
    (!!selectedMessages[0]?.media || selectedMessages[0]?.type === MessageType.MEDIA);

  // ─── Download selected media to device gallery ─────────────────────────────
  const handleDownloadMedia = async () => {
    const selectedMessage = selectedMessages[0];
    const mediaId = selectedMessage?.media?.id ?? "";
    const fileName = selectedMessage?.media?.filename;
    await downloadMedia(mediaId, fileName);

    clearSelection();
  };

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

  // ─── Step 1: User taps delete → store IDs and show confirmation ───────────
  const handleDeleteSelected = () => {
  const ids = selectedMessages
    .map((m) => m._id)
    .filter((id): id is string => Boolean(id));

  if (!ids.length) return;

    pendingDeleteIdsRef.current = ids;
    setShowDeleteConfirm(true);
  };

  // ─── Step 2: User confirms → remove from UI immediately, fire API in BG ───
  const handleConfirmDelete = () => {
    const ids = pendingDeleteIdsRef.current;
    if (!ids.length) return;

    // Close sheet & clear selection instantly — UI feels snappy
    setShowDeleteConfirm(false);
    setMessages((prev) =>
      prev.filter((msg) => !msg._id || !ids.includes(msg._id))
    );
    clearSelection();

    // Fire-and-forget: run API call in background, no await
    if (ids.length === 1) {
      deleteMessage(ids[0]);
    } else {
      deleteMessagesBulk(ids);
    }

    pendingDeleteIdsRef.current = [];
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    pendingDeleteIdsRef.current = [];
  };

  const sendMessageHandler = () => {
    if (message.trim()) {
      const messagePayload: MessagePayload = {
        participants: chat?.participants,
        messageType: MessageType.TEXT,
        message,
        chatType: isBroadcast ? ChatType.BROADCAST : ChatType.CHAT,
        chatId: chat?._id
      };

      if (messageContext) {
        messagePayload.context = {
          id: messageContext.waMessageId!,
          from: messageContext.from,
          message: messageContext.message,
        };
      }

      sendMessage({ messagePayload });
      setMessage("");
      setMessageContext(null);
    }
  };

  const openMediaViewer = (item: Message) => {
    if (item.type !== MessageType.MEDIA) return;

    router.push({
      pathname: "/(dashboard)/messages/mediaViewer",
      params: {
        mediaId: item.media?.id,
        mediaType: item.media?.mediaType,
        filename: item.media?.filename,
      },
    });
  };

  const toggleAttachment = () => {
    setShowAttachmentOptions((prev) => !prev);
  };

  const handleOpenContactInfo = () => {
    if (!chat) return;
    router.push({
      pathname: "/(dashboard)/messages/contactInfo",
      params: { chat: JSON.stringify(chat) },
    });
  };

  const handleReplySelected = () => {
    if (selectedMessages.length === 1) {
      setMessageContext(selectedMessages[0]);
      clearSelection();
      inputRef.current?.focus();   // jump focus to the input
    }
  }

  const handleCallContact = async () => {
    const number = chat?.participants?.[0]?.number;
    if (!number) return;
    await Linking.openURL(`tel:${number}`);
  };

  const sendMediaPage = (mediaSourceType: MediaSourceType) => {
    router.push({
      pathname: "/(dashboard)/messages/sendMedia",
      params: { mediaSourceType, chatId, chatData: JSON.stringify(chat) },
    });
  };

  const sendTemplatePage = () => {
    router.push({
      pathname: "/(dashboard)/messages/sendTemplate",
      params: { chatId, chatData: JSON.stringify(chat) },
    });
  };

  if (!chatId) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Select a chat</Text>
      </View>
    );
  }

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString();
  };

  const isBroadcast = chat.type === ChatType.BROADCAST;
  const partner = chat.participants[0];

  const displayName = isBroadcast
    ? chat.chatName || ChatType.BROADCAST
    : partner?.name || formatInternationalPhoneNumber(String(partner?.number)).international || "Unknown";

  const userName = isBroadcast
    ? chat.chatName || ChatType.BROADCAST
    : partner?.name || partner?.number || "Unknown";

  const displayImage = isBroadcast ? chat?.chatImage : partner?.imageUrl;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () =>
            isSelectionMode ? (
              <View>
                <Text style={styles.headerTitle}>
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
                <Text style={styles.headerTitle}>{displayName}</Text>
              </TouchableOpacity>
            ),

          headerLeft: () => (
            <View style={{ paddingRight: 10 }}>
              {isSelectionMode ? (
                <TouchableOpacity onPress={clearSelection}>
                  <X size={22} color={colors.text} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => router.back()}>
                  <ArrowLeft size={22} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          ),

          headerRight: () => (
            <View>
              {isSelectionMode ? (
                <View style={styles.selectionActionsRight}>
                  <TouchableOpacity onPress={handleReplySelected}>
                    <Reply height={20} width={20} fill={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteSelected}>
                    <Delete height={20} width={20} fill={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCopySelected}>
                    <Copy height={20} width={20} fill={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={clearSelection}>
                    <Forward height={20} width={20} fill={colors.text} />
                  </TouchableOpacity>
                  <AppMenu
                    trigger={<MoreVertical size={22} color={colors.text} />}
                    items={[
                      {
                        label: isBroadcast ? "Report" : "Info",
                        icon: <Info height={20} width={20} fill={colors.text} />,
                        onPress: () => {
                          if (isBroadcast) {
                            router.push({
                              pathname: "/(dashboard)/broadcast/broadcastReport",
                              params: {
                                chatId: chat._id,
                                messageId: selectedMessages[0]._id,
                              },
                            });
                          } else {
                            setShowMessageInfo(true);
                          }
                        },
                      },
                      ...(isSingleMediaSelected
                        ? [
                            {
                              label: "Download",
                              icon: <Download height={20} width={20} fill={colors.text} />,
                              onPress: handleDownloadMedia,
                            },
                          ]
                        : []),
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
                        onPress: () => {},
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          ),
        }}
      />

      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <KeyboardGestureArea
          interpolator="ios"
          style={{ flex: 1 }}
        >
          <ImageBackground
            source={WHATSAPP_BG}
            style={styles.messagesArea}
            imageStyle={styles.bgImage}
          >
            <FlatList
              data={loading ? [] : messages}
              inverted
              keyExtractor={(item) =>
                item._id || `${item.createdAt}-${item.message}`
              }
              ListEmptyComponent={
                loading ? <MessageBubbleShimmer count={8} /> : null
              }
              ListFooterComponent={
                <View>
                  {!hasMore && !loadingMore && (
                    <MessageContactInfoCard
                      chat={chat}
                      onCall={handleCallContact}
                      onProfile={handleOpenContactInfo}
                    />
                  )}
                  {loadingMore ? <MessageBubbleShimmer count={2} /> : null}
                </View>
              }
              renderItem={({ item, index }) => {
                const prevMsg = messages[index + 1];
                const showDate =
                  !prevMsg ||
                  new Date(prevMsg.createdAt ?? "").toDateString() !==
                    new Date(item.createdAt ?? "").toDateString();

                return (
                  <View>
                    {showDate && (
                      <View style={styles.dateSeparator}>
                        <Text style={styles.dateText}>
                          {getDateLabel(item.createdAt ?? "")}
                        </Text>
                      </View>
                    )}
                    <MessageBubble
                      chat={chat}
                      message={item}
                      isSelected={selectedIds.has(item._id)}
                      onPress={() => {
                        if (isSelectionMode) {
                          toggleMessageSelection(item);
                          return;
                        }

                        openMediaViewer(item);
                      }}
                      onLongPress={() => {
                        setIsSelectionMode(true);
                        toggleMessageSelection(item);
                      }}
                      onReply={(msg) => { 
                        setMessageContext(msg);
                        inputRef.current?.focus();
                      }}
                    />
                  </View>
                );
              }}
              contentContainerStyle={styles.messagesContent}
              onEndReached={() => {
                if (hasMore) loadMore();
              }}
              onEndReachedThreshold={0.3}
              renderScrollComponent={renderScrollComponent}
              keyboardShouldPersistTaps="handled"
            />

            <KeyboardStickyView offset={stickyViewOffset}>
              <WhatsAppInputBar
                inputRef={inputRef}
                message={message}
                setMessage={setMessage}
                onSend={sendMessageHandler}
                onAttachPress={toggleAttachment}
                onCameraPress={() => sendMediaPage(MediaSourceType.CAMERA)}
                messageContext={messageContext}
                onClearReply={() => setMessageContext(null)}
              />
              <AttachmentSheet
                visible={showAttachmentOptions}
                onClose={toggleAttachment}
                actions={[
                  {
                    key: "camera",
                    label: "Camera",
                    renderIcon: () => <CameraIcon height={25} width={25} />,
                    onPress: () => sendMediaPage(MediaSourceType.CAMERA),
                  },
                  {
                    key: "gallery",
                    label: "Gallery",
                    renderIcon: () => <GalleryIcon height={25} width={25} />,
                    onPress: () => sendMediaPage(MediaSourceType.GALLERY),
                  },
                  {
                    key: "document",
                    label: "Document",
                    renderIcon: () => <DocumentIcon height={25} width={25} />,
                    onPress: () => sendMediaPage(MediaSourceType.DOCUMENT),
                  },
                  {
                    key: "audio",
                    label: "Audio",
                    renderIcon: () => <AudioIcon height={25} width={25} />,
                    onPress: () => sendMediaPage(MediaSourceType.AUDIO),
                  },
                  {
                    key: "location",
                    label: "Location",
                    renderIcon: () => <LocationIcon height={25} width={25} />,
                  },
                  {
                    key: "template",
                    label: "Template",
                    renderIcon: () => <Template height={25} width={25} />,
                    onPress: sendTemplatePage,
                  },
                ]}
              />
            </KeyboardStickyView>
          </ImageBackground>
        </KeyboardGestureArea>
      </SafeAreaView>

      {/* ─── Delete Confirmation Sheet ─────────────────────────────────────── */}
      <ConfirmSheet
        visible={showDeleteConfirm}
        title={
          pendingDeleteIdsRef.current.length === 1
            ? "Delete message?"
            : `Delete ${pendingDeleteIdsRef.current.length} messages?`
        }
        description="This action cannot be undone."
        confirmText="Delete"
        loading={false}         // never block — we delete optimistically
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        colors={colors}
      />

      <MessageInfoDialog
        visible={showMessageInfo}
        onClose={() => {
          setShowMessageInfo(false);
          clearSelection();
        }}
        messages={selectedMessages}
      />

    </>
  );
}

const getStyles = (colors: typeof lightColors, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { color: colors.text },
    headerTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    selectionActionsRight: {
      flexDirection: "row",
      gap: 15,
    },
    emojiContainer: {
      height: 300,
    },
    messagesArea: {
      flex: 1,
      position: "relative",
    },
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
    dateSeparator: {
      alignItems: "center",
      marginVertical: 6,
    },
    dateText: {
      fontSize: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: isDark ? "#2E2F2F" : "#FFFFFF",
      color: colors.text,
      overflow: "hidden",
      elevation: 2,
    },
    loadMoreWrap: {
      paddingVertical: 10,
      alignItems: "center",
    },
    messagesContent: {
      paddingVertical: 8,
      flexGrow: 1,
    },
    mediaPreviewContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginHorizontal: 12,
      marginBottom: 8,
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
    },
    mediaPreviewImage: {
      width: 48,
      height: 48,
      borderRadius: 6,
    },
    mediaPreviewFallback: {
      width: 48,
      height: 48,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mediaPreviewFallbackText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "600",
      textAlign: "center",
    },
    mediaPreviewName: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
    },
  });