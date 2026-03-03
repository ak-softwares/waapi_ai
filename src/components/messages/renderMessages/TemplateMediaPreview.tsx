// components/chat/TemplateMediaPreview.tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
} from "react-native";

import { Video } from "expo-av";

import { fetchMediaBlob } from "@/src/services/media/media.service";
import { TemplateHeaderComponentCreate } from "@/src/types/Template";

// SVG Icons
import CameraIcon from "@/assets/messageIcons/camera.svg";
import DocumentIcon from "@/assets/messageIcons/document-icon.svg";
import ImageIcon from "@/assets/messageIcons/image.svg";
import LocationIcon from "@/assets/messageIcons/location-icon.svg";

/* ------------------------------------------------
   ICON HANDLER
------------------------------------------------ */

function getMediaIcon(mediaType: string) {
  switch (mediaType) {
    case "IMAGE":
      return CameraIcon;

    case "VIDEO":
      return ImageIcon;

    case "LOCATION":
      return LocationIcon;

    default:
      return DocumentIcon;
  }
}

/* ------------------------------------------------
   FALLBACK
------------------------------------------------ */

function TemplateMediaFallback({ mediaType }: { mediaType: string }) {
  const Icon = getMediaIcon(mediaType);

  return (
    <View style={styles.fallbackBox}>
      {Icon && <Icon width={60} height={60} />}
    </View>
  );
}

/* ------------------------------------------------
   LOADING
------------------------------------------------ */

function TemplateMediaLoading() {
  return (
    <View style={styles.loadingBox}>
      <ActivityIndicator color="#fff" />
    </View>
  );
}

/* ------------------------------------------------
   MAIN
------------------------------------------------ */

export default function TemplateMediaPreview({
  h,
}: {
  h: TemplateHeaderComponentCreate;
}) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const mediaType = h.format; // IMAGE | VIDEO | DOCUMENT
  const mediaIdOrUrl = h?.example?.header_handle?.[0] ?? null;

  const isUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  /* ---------------- LOAD MEDIA ---------------- */

  useEffect(() => {
    if (!mediaIdOrUrl) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        if (isUrl(mediaIdOrUrl)) {
          if (mounted) setMediaUrl(mediaIdOrUrl);
        } else {
          const url = await fetchMediaBlob(mediaIdOrUrl);
          if (mounted) setMediaUrl(url);
        }
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
  }, [mediaIdOrUrl]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return <TemplateMediaLoading />;
  }

  /* ---------------- FALLBACK ---------------- */

  if (!mediaUrl || error) {
    return <TemplateMediaFallback mediaType={mediaType} />;
  }

  /* ---------------- IMAGE ---------------- */

  if (mediaType === "IMAGE") {
    return (
      <Image
        source={{ uri: mediaUrl }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setError(true)}
      />
    );
  }

  /* ---------------- VIDEO ---------------- */

  if (mediaType === "VIDEO") {
    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: mediaUrl }}
          style={styles.video}
          useNativeControls
          onError={() => setError(true)}
        />
      </View>
    );
  }

  /* ---------------- DOCUMENT ---------------- */

  if (mediaType === "DOCUMENT") {
    return <TemplateMediaFallback mediaType={mediaType} />;
  }

  return null;
}

/* ------------------------------------------------
   STYLES
------------------------------------------------ */

const styles = StyleSheet.create({
  loadingBox: {
    width: "100%",
    height: 130,
    borderRadius: 10,
    backgroundColor: "#DCF8C6",
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackBox: {
    width: "100%",
    height: 130,
    borderRadius: 10,
    backgroundColor: "#DCF8C6",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },

  videoContainer: {
    backgroundColor: "#000",
    borderRadius: 10,
    overflow: "hidden",
  },

  video: {
    width: "100%",
    height: 200,
  },
});