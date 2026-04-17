// hooks/useMedia.ts

import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useState } from "react";

import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utils/toastHelper/toast";

import {
    MEDIA_EXTENSIONS,
    MEDIA_MIME_TYPES,
    MediaType,
} from "@/src/utils/enums/mediaTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ------------------------------------------------
   HOOK
------------------------------------------------ */

export function useMedia() {
  const [uploading, setUploading] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);

  /* ------------------------------------------------
     VALIDATE MEDIA
  ------------------------------------------------ */

  const validateMedia = useCallback(
    (
      file: {
        uri: string;
        name?: string;
        size?: number;
        mimeType?: string;
      },
      format: MediaType
    ) => {
      const maxSize = 5 * 1024 * 1024;

      if (!file?.uri) return "No file selected";

      if (file.size && file.size > maxSize) {
        return "File must be less than 5MB";
      }

      const ext = file.name?.split(".").pop()?.toLowerCase() || "";

      if (file.mimeType && !MEDIA_MIME_TYPES[format].includes(file.mimeType)) {
        return `Invalid ${format.toLowerCase()} file type`;
      }

      if (ext && !MEDIA_EXTENSIONS[format].includes(ext)) {
        return `${format} must be one of: ${MEDIA_EXTENSIONS[format].join(
          ", "
        )}`;
      }

      return null;
    },
    []
  );

  /* ------------------------------------------------
     UPLOAD MEDIA
  ------------------------------------------------ */

  const uploadMedia = useCallback(async (file: {
    uri: string;
    name?: string;
    mimeType?: string;
  }) => {
    setUploading(true);

    try {
      const form = new FormData();

      form.append("file", {
        uri: file.uri,
        name: file.name || "file",
        type: file.mimeType || "application/octet-stream",
      } as any);

      const res = await api.post("/wa-accounts/media", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const json = res.data;

      if (!json.success) {
        throw new Error(json.message);
      }

      return json.data.mediaId as string;
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.message || "Media upload failed",
      });

      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  /* ------------------------------------------------
     FETCH MEDIA (WITH CACHE)
  ------------------------------------------------ */

  const fetchMedia = useCallback(async (mediaId: string) => {
    setLoadingMedia(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const fileUri = `${FileSystem.cacheDirectory}${mediaId}`;

      // check cache
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (fileInfo.exists) {
        return fileUri;
      }

      const downloadUrl = `${api.defaults.baseURL}/wa-accounts/media/${mediaId}`;

      const result = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return result.uri;
    } catch (err: any) {
      console.error("Media download error:", err);

      showToast({
        type: "error",
        message: "Failed to load media",
      });

      throw err;
    } finally {
      setLoadingMedia(false);
    }
  }, []);


  return {
    uploading,
    loadingMedia,
    validateMedia,
    uploadMedia,
    fetchMedia,
  };
}