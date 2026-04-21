import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Video } from "expo-av";
import { PlayIcon } from "lucide-react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";

import { useMedia } from "@/src/hooks/messages/useMedia";
import { MediaType } from "@/src/utils/enums/mediaTypes";

import AudioIcon from "@/assets/messageIcons/audio.svg";
import DocumentIcon from "@/assets/messageIcons/document-icon.svg";

interface Props {
  mediaId?: string;
  mediaUrl?: string;
  mediaType: MediaType;
  filename?: string;
}

export default function MediaRenderer({
  mediaId,
  mediaUrl: initialUrl,
  mediaType,
  filename,
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { fetchMedia } = useMedia();

  const [mediaUrl, setMediaUrl] = useState<string | null>(initialUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isUrl = (value: string) => {
    return value.startsWith("http://") || value.startsWith("https://");
  };
  
  /* LOAD MEDIA IF ONLY ID IS GIVEN */
  useEffect(() => {
    if (initialUrl) return;
    if (!mediaId) return;

    let mounted = true;
    let url: string;

    const load = async () => {
      try {
        setLoading(true);
        if (isUrl(mediaId)) {
          url = mediaId;
        } else {
          url = await fetchMedia(mediaId);
        }

        if (mounted) setMediaUrl(url);
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [mediaId]);

  /* LOADING */

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.secondaryText} />
      </View>
    );
  }

  /* FALLBACK */

  if (!mediaUrl || error) {
    return (
      <View style={styles.fallback}>
        {mediaType === MediaType.DOCUMENT && (
          <DocumentIcon width={40} height={40} fill={colors.secondaryText} />
        )}

        {mediaType === MediaType.AUDIO && (
          <AudioIcon width={40} height={40} fill={colors.secondaryText} />
        )}

        {!!filename && <Text style={styles.filename}>{filename}</Text>}
      </View>
    );
  }

  /* IMAGE */

  if (mediaType === MediaType.IMAGE) {
    return (
      <Image
        source={{ uri: mediaUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    );
  }

  /* VIDEO */

  if (mediaType === MediaType.VIDEO) {
    return (
      <View style={styles.videoContainer}>
        {!isPlaying ? (
          <Pressable
            style={styles.playOverlay}
            onPress={() => setIsPlaying(true)}
          >
            <PlayIcon width={50} height={50} fill="#fff" />
          </Pressable>
        ) : (
          <Video
            source={{ uri: mediaUrl }}
            style={styles.video}
            useNativeControls
            shouldPlay
          />
        )}
      </View>
    );
  }

  /* AUDIO */

  if (mediaType === MediaType.AUDIO) {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.audioPreview}
          onPress={() => setIsPlaying(true)}
        >
          <AudioIcon width={28} height={28} fill={colors.text} />

          {isPlaying && (
            <Video
              source={{ uri: mediaUrl }}
              style={styles.audio}
              useNativeControls
              shouldPlay
            />
          )}
        </Pressable>
      </View>
    );
  }

  /* DOCUMENT */

  if (mediaType === MediaType.DOCUMENT) {
    return (
      <View style={styles.fallback}>
        <DocumentIcon width={40} height={40} fill={colors.secondaryText} />
        {!!filename && <Text style={styles.filename}>{filename}</Text>}
      </View>
    );
  }

  return null;
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      width: "100%",
      alignSelf: "stretch",
    },

    loading: {
      width: "100%",
      height: 140,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(185,182,182,0.1)",
    },

    fallback: {
      width: "100%",
      height: 140,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(185,182,182,0.1)",
    },

    image: {
      width: "100%",
      maxHeight: 300,
      aspectRatio: 2,
      borderRadius: 8,
    },

    videoContainer: {
      width: "100%",
      height: 200,
      borderRadius: 8,
      backgroundColor: "#000",
      justifyContent: "center",
      alignItems: "center",
    },

    playOverlay: {
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
    },

    video: {
      width: "100%",
      height: 200,
      borderRadius: 8,
    },

    audioPreview: {
      flex: 1,
      width: "100%",
      alignSelf: "stretch",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 8,
      backgroundColor: "rgba(185,182,182,0.1)",
    },

    audio: {
      flex: 1,
      width: "100%",
      height: 60,
        // width: "100%",
      alignSelf: "stretch",
    },

    filename: {
      marginTop: 4,
      fontSize: 13,
      color: colors.text,
    },
  });