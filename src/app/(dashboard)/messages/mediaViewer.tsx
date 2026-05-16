import { Video } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Download } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/context/ThemeContext";
import { useMedia } from "@/src/hooks/messages/useMedia";
import { darkColors, lightColors } from "@/src/theme/colors";
import { MediaType } from "@/src/utils/enums/mediaTypes";
import { showToast } from "@/src/utils/toastHelper/toast";

interface MediaViewerParams extends Record<string, string> {
  mediaId: string;
  mediaType: string;
  filename: string;
}

export default function MediaViewerScreen() {
  const {
    mediaId,
    mediaType: rawMediaType = MediaType.DOCUMENT,
    filename,
  } = useLocalSearchParams<MediaViewerParams>();

  const mediaType = (rawMediaType as MediaType) ?? MediaType.DOCUMENT;
  const { fetchMedia } = useMedia();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [loading, setLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadMedia = async () => {
      if (!mediaId) {
        setLoading(false);
        return;
      }

      try {
        if (mediaId.startsWith("http://") || mediaId.startsWith("https://")) {
          setMediaUrl(mediaId);
        } else {
          const localUri = await fetchMedia(mediaId);
          setMediaUrl(localUri);
        }
      } catch {
        showToast({ type: "error", message: "Unable to open media" });
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [mediaId, fetchMedia]);

  const handleDownload = async () => {
    if (!mediaUrl) return;

    try {
      setDownloading(true);
      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        showToast({ type: "error", message: "Media permission denied" });
        return;
      }

      let fileUri = mediaUrl;

      if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) {
        const ext = filename?.split(".").pop() || "bin";
        const output = `${FileSystem.cacheDirectory}download-${Date.now()}.${ext}`;
        const result = await FileSystem.downloadAsync(mediaUrl, output);
        fileUri = result.uri;
      }

      await MediaLibrary.saveToLibraryAsync(fileUri);
      showToast({ type: "success", message: "Media downloaded" });
    } catch {
      showToast({ type: "error", message: "Download failed" });
    } finally {
      setDownloading(false);
    }
  };

  const isImage = mediaType === MediaType.IMAGE;
  const isVideo = mediaType === MediaType.VIDEO;

  return (
    <>
      <Stack.Screen
        options={{
          title: filename || "Media",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingRight: 10 }}>
              <ArrowLeft color={colors.text} size={22} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleDownload} disabled={downloading || !mediaUrl}>
              <Download color={colors.text} size={22} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : !mediaUrl ? (
          <View style={styles.center}>
            <Text style={styles.message}>Media unavailable</Text>
          </View>
        ) : isImage ? (
          <ScrollView
            style={styles.zoomWrap}
            contentContainerStyle={styles.zoomContent}
            minimumZoomScale={1}
            maximumZoomScale={4}
            pinchGestureEnabled
            bouncesZoom
          >
            <Image source={{ uri: mediaUrl }} style={styles.image} resizeMode="contain" />
          </ScrollView>
        ) : isVideo ? (
          <Video source={{ uri: mediaUrl }} style={styles.video} useNativeControls shouldPlay />
        ) : (
          <View style={styles.center}>
            <Text style={styles.message}>Preview not available for this media type.</Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    zoomWrap: {
      flex: 1,
    },
    zoomContent: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    video: {
      width: "100%",
      height: 320,
      marginTop: 20,
      backgroundColor: "#000",
    },
    message: {
      color: colors.text,
      textAlign: "center",
    },
  });
