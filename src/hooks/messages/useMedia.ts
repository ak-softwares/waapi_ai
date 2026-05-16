// hooks/useMedia.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useState } from "react";

import { api } from "@/src/lib/api/apiClient";
import {
  MEDIA_EXTENSIONS,
  MEDIA_MIME_TYPES,
  MediaType,
} from "@/src/utils/enums/mediaTypes";
import { showToast } from "@/src/utils/toastHelper/toast";

/* ------------------------------------------------
   HOOK
------------------------------------------------ */

export function useMedia() {
  const [uploading, setUploading] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [downloading, setDownloading] = useState(false);

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
        return `${format} must be one of: ${MEDIA_EXTENSIONS[format].join(", ")}`;
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
        headers: { "Content-Type": "multipart/form-data" },
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

  const fetchMedia = useCallback(async (mediaId: string, fileName?: string) => {
    setLoadingMedia(true);

    try {
      const token = await AsyncStorage.getItem("token");

      // Use fileName in cache key so the file has the right extension
      // e.g. cacheDir/abc123_invoice.pdf  — avoids serving wrong mime type
      const cacheKey = fileName ? `${mediaId}_${fileName}` : mediaId;
      const fileUri = `${FileSystem.cacheDirectory}${cacheKey}`;

      // Return from cache if already downloaded
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

      // Verify the file actually has content
      const resultInfo = await FileSystem.getInfoAsync(result.uri);
      if (!resultInfo.exists || resultInfo.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      return result.uri;
    } catch (err: any) {
      console.error("Media fetch error:", err);
      showToast({
        type: "error",
        message: "Failed to load media",
      });
      throw err;
    } finally {
      setLoadingMedia(false);
    }
  }, []);

  /* ------------------------------------------------
     DOWNLOAD MEDIA TO DEVICE
  ------------------------------------------------ */

  const downloadMedia = useCallback(
    async (mediaId?: string, fileName?: string) => {
      if (!mediaId) {
        showToast({ type: "error", message: "Media not found" });
        return;
      }

      setDownloading(true);

      try {
        // 1. Request device storage permission
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          showToast({ type: "error", message: "Storage permission denied" });
          return;
        }

        // 2. Resolve a clean filename — strip query params if URL was passed
        const resolvedName =
          fileName ||
          `media_${mediaId}_${Date.now()}`;

        // 3. Fetch (uses cache if already downloaded before)
        const cachedUri = await fetchMedia(mediaId, resolvedName);

        // 4. Save cached file to device gallery / files
        await MediaLibrary.createAssetAsync(cachedUri);

        showToast({ type: "success", message: "Saved to gallery" });
      } catch (err: any) {
        showToast({
          type: "error",
          message: err?.message || "Failed to download file",
        });
      } finally {
        setDownloading(false);
      }
    },
    [fetchMedia]
  );

  return {
    uploading,
    loadingMedia,
    downloading,
    validateMedia,
    uploadMedia,
    fetchMedia,
    downloadMedia,
  };
}