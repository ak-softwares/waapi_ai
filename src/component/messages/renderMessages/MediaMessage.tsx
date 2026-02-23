// components/chat/MediaMessage.tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Video } from "expo-av";

import { fetchMediaBlob } from "@/src/services/media/media.service";
import { Message } from "@/src/types/Messages";
import { MediaType } from "@/src/utiles/enums/mediaTypes";
import { FormatRichText } from "@/src/utiles/formatText/formatRichText";

// SVG Icons
import AudioIcon from "@/assets/messageIcons/audio.svg";
import CameraIcon from "@/assets/messageIcons/camera.svg";
import DocumentIcon from "@/assets/messageIcons/document-icon.svg";
import ImageIcon from "@/assets/messageIcons/image.svg";

interface Props {
  message: Message;
}

/* ---------------- LOADING ---------------- */

function MediaLoading() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#fff" />
    </View>
  );
}

export default function MediaMessage({ message }: Props) {
  const mediaId = message.media?.id || null;
  const mediaType = message.media?.mediaType || "";

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  /* ---------------- LOAD MEDIA ---------------- */

  useEffect(() => {
    if (!mediaId) return;

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        setMediaUrl(null);

        const url = await fetchMediaBlob(mediaId);

        if (mounted) setMediaUrl(url);
      } catch (e) {
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

  /* ---------------- ICON ---------------- */

  const getMediaIcon = () => {
    switch (mediaType) {
      case MediaType.IMAGE:
        return CameraIcon;

      case MediaType.VIDEO:
        return ImageIcon;

      case MediaType.AUDIO:
        return AudioIcon;

      default:
        return DocumentIcon;
    }
  };

  const MediaIcon = getMediaIcon();

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return <MediaLoading />;
  }

  /* ---------------- FALLBACK ---------------- */

  if (!mediaUrl || error) {
    const fileName = message.media?.filename || "";

    return (
      <View style={styles.container}>
        <View style={styles.fallbackBox}>
          {MediaIcon && <MediaIcon width={60} height={60} />}
        </View>

        {!!fileName && <Text style={styles.fileName}>{fileName}</Text>}
      </View>
    );
  }

  /* ---------------- IMAGE ---------------- */

  if (mediaType === MediaType.IMAGE) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: mediaUrl }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setError(true)}
        />
      </View>
    );
  }

  /* ---------------- VIDEO ---------------- */

  if (mediaType === MediaType.VIDEO) {
    return (
      <View style={styles.container}>
        <Video
          source={{ uri: mediaUrl }}
          style={styles.video}
          useNativeControls
          onError={() => setError(true)}
        />
      </View>
    );
  }

  /* ---------------- AUDIO ---------------- */

  if (mediaType === MediaType.AUDIO) {
    return (
      <View style={styles.container}>
        <Video
          source={{ uri: mediaUrl }}
          style={styles.audio}
          useNativeControls
          onError={() => setError(true)}
        />
      </View>
    );
  }

  /* ---------------- DOCUMENT ---------------- */

  if (mediaType === MediaType.DOCUMENT) {
    const fileName = message.media?.filename || "";

    return (
      <View style={styles.container}>
        <View style={styles.fallbackBox}>
          <DocumentIcon width={60} height={60} />
        </View>

        {!!fileName && <Text style={styles.fileName}>{fileName}</Text>}
      </View>
    );
  }

  /* ---------------- TEXT FALLBACK ---------------- */

  return (
    <View>
      <FormatRichText text={message.message || ""} />
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
    width: 260,
  },

  loadingContainer: {
    width: 240,
    height: 140,
    borderRadius: 10,
    backgroundColor: "#DCF8C6",
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackBox: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#DCF8C6",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    aspectRatio: 1.2,
    borderRadius: 10,
  },

  video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },

  audio: {
    width: 250,
    height: 60,
  },

  fileName: {
    marginTop: 4,
    fontSize: 13,
    marginLeft: 4,
  },
});