import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Trash2, X } from "lucide-react-native";

import Send from "@/assets/messageInput/send-message.svg";
import { useTheme } from "@/src/context/ThemeContext";
import { useMedia } from "@/src/hooks/messages/useMedia";
import { useSendMessage } from "@/src/hooks/messages/useSendMessage";
import { darkColors, lightColors } from "@/src/theme/colors";
import { ChatParticipant, ChatType } from "@/src/types/Chat";
import { MessagePayload, MessageType } from "@/src/types/Messages";
import { MediaSourceType, MediaType } from "@/src/utiles/enums/mediaTypes";
import { ActivityIndicator } from "react-native";

type UploadedFile = {
  mediaId: string;
  mediaType: MediaType;
  previewUri: string;
  fileName?: string;
  mimeType?: string;
  caption?: string;
};

type SelectedFile = {
  uri: string;
  mediaType: MediaType;
  fileName?: string;
  mimeType?: string;
};

type Params = {
  mediaSourceType: MediaSourceType;
  chatId: string;
  chatData?: string;
};

export default function SendMediaScreen() {
  const { mediaSourceType, chatId, chatData } = useLocalSearchParams<Params>();
  const parsedChat = useMemo(() => (chatData ? JSON.parse(chatData) : null), [chatData]);
  const participants = (parsedChat?.participants as ChatParticipant[]) || [];
  const chatType = (parsedChat?.type as ChatType) || ChatType.CHAT;
  const { isSending, sendMessage } = useSendMessage();

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors, theme === "dark");

  const { uploadMedia, fetchMedia, uploading, loadingMedia } = useMedia();

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const previewRef = useRef<FlatList<UploadedFile>>(null);
  const { width, height } = useWindowDimensions();
  const maxPreviewHeight = height * 0.7;

  const isBroadcast = chatType === ChatType.BROADCAST;

  const uploadAndBuildPreviewFiles = useCallback(
    async (selectedFiles: SelectedFile[]) => {
      const uploadedFiles: UploadedFile[] = [];

      for (const selectedFile of selectedFiles) {
        const mediaId = await uploadMedia({
          uri: selectedFile.uri,
          name: selectedFile.fileName,
          mimeType: selectedFile.mimeType,
        });

        const previewUri = await fetchMedia(mediaId);

        uploadedFiles.push({
          mediaId,
          mediaType: selectedFile.mediaType,
          previewUri,
          fileName: selectedFile.fileName,
          mimeType: selectedFile.mimeType,
          caption: "",
        });
      }

      setFiles(uploadedFiles);
      setCurrentIndex(0);
    },
    [fetchMedia, uploadMedia]
  );

  const openCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      router.back();
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "videos"],
      quality: 1,
    });

    if (result.canceled) {
      router.back();
      return;
    }

    const asset = result.assets[0];
    await uploadAndBuildPreviewFiles([
      {
        uri: asset.uri,
        mediaType: asset.type === "video" ? MediaType.VIDEO : MediaType.IMAGE,
        fileName: asset.fileName ?? "",
        mimeType: asset.mimeType,
      },
    ]);
  }, [uploadAndBuildPreviewFiles]);

  const openGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 1,
    });

    if (result.canceled) {
      router.back();
      return;
    }

    await uploadAndBuildPreviewFiles(
      result.assets.map((asset) => ({
        uri: asset.uri,
        mediaType: asset.type === "video" ? MediaType.VIDEO : MediaType.IMAGE,
        fileName: asset.fileName ?? "",
        mimeType: asset.mimeType,
      }))
    );
  }, [uploadAndBuildPreviewFiles]);

  const openDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true });
    if (result.canceled) {
      router.back();
      return;
    }

    await uploadAndBuildPreviewFiles(
      result.assets.map((doc) => ({
        uri: doc.uri,
        mediaType: MediaType.DOCUMENT,
        fileName: doc.name,
        mimeType: doc.mimeType,
      }))
    );
  }, [uploadAndBuildPreviewFiles]);

  const openAudio = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, type: "audio/*" });
    if (result.canceled) {
      router.back();
      return;
    }

    await uploadAndBuildPreviewFiles(
      result.assets.map((doc) => ({
        uri: doc.uri,
        mediaType: MediaType.AUDIO,
        fileName: doc.name,
        mimeType: doc.mimeType,
      }))
    );
  }, [uploadAndBuildPreviewFiles]);

  useEffect(() => {
    const init = async () => {
      switch (mediaSourceType) {
        case MediaSourceType.CAMERA:
          await openCamera();
          break;
        case MediaSourceType.GALLERY:
          await openGallery();
          break;
        case MediaSourceType.DOCUMENT:
          await openDocument();
          break;
        case MediaSourceType.AUDIO:
          await openAudio();
          break;
        default:
          router.back();
      }
    };

    init();
  }, [mediaSourceType, openAudio, openCamera, openDocument, openGallery]);

  const currentFile = files[currentIndex];

  const setCurrentCaption = (value: string) => {
    setFiles((prev) =>
      prev.map((file, index) => (index === currentIndex ? { ...file, caption: value } : file))
    );
  };

  const removeCurrentMedia = () => {
    setFiles((prev) => {
      const next = prev.filter((_, index) => index !== currentIndex);
      if (!next.length) {
        router.back();
        return next;
      }

      const safeIndex = Math.max(0, Math.min(currentIndex, next.length - 1));
      setTimeout(() => {
        previewRef.current?.scrollToIndex({ index: safeIndex, animated: true });
      }, 0);
      setCurrentIndex(safeIndex);
      return next;
    });
  };

  const handleSend = async () => {
    for (const file of files) {
      const messagePayload: MessagePayload = {
        participants,
        messageType: MessageType.MEDIA,
        media: {
          id: file.mediaId,
          mediaType: file.mediaType,
          caption: file.caption?.trim() || undefined,
          // ✅ only add filename for DOCUMENT
          ...(file.mediaType === MediaType.DOCUMENT && {
            filename: file.fileName,
          }),
        },
        chatType: isBroadcast ? ChatType.BROADCAST : ChatType.CHAT,
        chatId: chatId || "",
      };
      await sendMessage({ messagePayload });
    }

    router.back();
  
  };

  const renderMainItem = ({ item }: { item: UploadedFile }) => {
    return (
      <View style={[styles.previewContainer, { width, height: maxPreviewHeight }]}>
        {item.mediaType === MediaType.IMAGE && (
          <Image source={{ uri: item.previewUri }} style={styles.previewMedia} resizeMode="contain" />
        )}

        {item.mediaType === MediaType.VIDEO && (
          <Video source={{ uri: item.previewUri }} style={styles.previewMedia} useNativeControls />
        )}

        {item.mediaType !== MediaType.IMAGE && item.mediaType !== MediaType.VIDEO && (
          <View style={styles.previewFallback}>
            <Text style={styles.previewType}>{item.mediaType}</Text>
            <Text style={styles.previewFile}>{item.fileName || "File"}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
        style={styles.container}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.circleButton}>
            <X size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!files.length || uploading || isSending}
            onPress={removeCurrentMedia}
            style={[styles.circleButton, (!files.length || uploading || isSending) && styles.disabled]}
          >
            <Trash2 size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
        {(uploading || loadingMedia) && (
          <View style={[styles.previewContainer, { width, height: maxPreviewHeight }]}>
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          </View>
        )}
        <FlatList
          ref={previewRef}
          data={files}
          horizontal
          pagingEnabled
          keyExtractor={(item, index) => `${item.mediaId}-${index}`}
          renderItem={renderMainItem}
          onMomentumScrollEnd={(event) => {
            const pageWidth = event.nativeEvent.layoutMeasurement.width;
            const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
            setCurrentIndex(index);
          }}
          showsHorizontalScrollIndicator={false}
          style={styles.previewList}
        />

        {!!files.length && (
          <FlatList
            data={files}
            horizontal
            keyExtractor={(item, index) => `thumb-${item.mediaId}-${index}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbRow}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => {
                  setCurrentIndex(index);
                  previewRef.current?.scrollToIndex({ index, animated: true });
                }}
                style={[styles.thumbWrap, index === currentIndex && styles.thumbActive]}
              >
                {item.mediaType === MediaType.IMAGE ? (
                  <Image source={{ uri: item.previewUri }} style={styles.thumb} />
                ) : (
                  <View style={styles.thumbLabelWrap}>
                    <Text style={styles.thumbLabel}>{item.mediaType.slice(0, 3)}</Text>
                  </View>
                )}
              </Pressable>
            )}
          />
        )}

        <View style={styles.bottomBar}>
          <TextInput
            value={currentFile?.caption || ""}
            onChangeText={setCurrentCaption}
            placeholder="Add a caption"
            placeholderTextColor={colors.mutedText}
            style={styles.captionInput}
          />

          <TouchableOpacity
            disabled={!files.length || uploading || isSending}
            onPress={handleSend}
            style={[
              styles.sendButton,
              (!files.length || uploading || isSending) && styles.disabled,
            ]}
          >
            <Send height={28} width={28} fill={colors.butttonTextSecondary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (colors: typeof lightColors, isDark: boolean) =>
  StyleSheet.create({
    previewList: {
      flexGrow: 0,
    },

    previewContainer: {
      justifyContent: "center",
      alignItems: "center",
    },

    loaderOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },

    previewMedia: {
      maxWidth: "100%",
      maxHeight: "100%",
      width: "100%",
      height: "100%",
    },

    previewFallback: {
      alignItems: "center",
      justifyContent: "center",
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 56,
      paddingBottom: 8,
      backgroundColor: colors.background,
    },
    circleButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    previewType: {
      color: isDark ? "#fff" : colors.text,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 8,
    },
    previewFile: {
      color: isDark ? "#bcc5d1" : colors.mutedText,
      fontSize: 14,
    },
    thumbRow: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 8,
      backgroundColor: colors.background,
    },
    thumbWrap: {
      width: 56,
      height: 56,
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#334155",
    },
    thumbActive: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    thumb: {
      width: "100%",
      height: "100%",
    },
    thumbLabelWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    thumbLabel: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 10,
    },
    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    captionInput: {
      flex: 1,
      minHeight: 50,
      borderRadius: 26,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      fontSize: 18,
      maxHeight: 120,
      color: colors.text,
    },
    sendButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    disabled: {
      opacity: 0.5,
    },
  });
