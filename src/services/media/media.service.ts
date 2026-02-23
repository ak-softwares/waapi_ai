// services/media.service.ts

import * as FileSystem from "expo-file-system";

import {
  MEDIA_EXTENSIONS,
  MEDIA_MIME_TYPES,
  MediaType,
} from "@/src/utiles/enums/mediaTypes";

/* ------------------------------------------------
   VALIDATE MEDIA
------------------------------------------------ */

export function validateMedia(
  file: {
    uri: string;
    name?: string;
    size?: number;
    mimeType?: string;
  },
  format: MediaType
) {
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
}

/* ------------------------------------------------
   UPLOAD MEDIA
------------------------------------------------ */

export async function uploadMediaApi(file: {
  uri: string;
  name?: string;
  mimeType?: string;
}) {
  const form = new FormData();

  form.append("file", {
    uri: file.uri,
    name: file.name || "file",
    type: file.mimeType || "application/octet-stream",
  } as any);

  const res = await fetch("/api/wa-accounts/media", {
    method: "POST",
    body: form,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data.mediaId as string;
}

/* ------------------------------------------------
   FETCH MEDIA
   (with caching like WhatsApp)
------------------------------------------------ */

export async function fetchMediaBlob(mediaId: string) {
  // const fileUri = `${FileSystem.cacheDirectory}${mediaId}`;
  const fileUri = `${mediaId}`;

  // ✅ return cached file if exists
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (fileInfo.exists) {
    return fileUri;
  }

  // ✅ download from API
  const downloadUrl = `/api/wa-accounts/media/${mediaId}`;

  const result = await FileSystem.downloadAsync(downloadUrl, fileUri);

  return result.uri;
}