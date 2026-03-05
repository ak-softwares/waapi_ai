import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

export type HeaderMediaState = {
  uri: string | null;
  fileName: string;
  mimeType: string;
  handle?: string[];
};

export function useHeaderMediaUpload() {
  const [headerMedia, setHeaderMedia] = useState<HeaderMediaState>({
    uri: null,
    fileName: "",
    mimeType: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  const uploadHeaderMedia = async (file: {
    uri: string;
    name: string;
    type: string;
  }) => {
    setIsUploading(true);

    try {
      const form = new FormData();

      form.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const { data } = await api.post(
        "/wa-accounts/templates/upload-media",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (!data?.success) {
        throw new Error(data?.message || "Upload failed");
      }

      setHeaderMedia({
        uri: file.uri,
        fileName: file.name,
        mimeType: file.type,
        handle: data.data.header_handle,
      });

      showToast({
        type: "success",
        message: "Media uploaded successfully",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Media upload failed",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = () => {
    setHeaderMedia({
      uri: null,
      fileName: "",
      mimeType: "",
    });
  };

  return {
    headerMedia,
    isUploading,
    uploadHeaderMedia,
    removeMedia,
  };
}