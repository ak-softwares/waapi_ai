import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utils/toastHelper/toast";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";

type DownloadProps = {
  chatId: string;
  messageId: string;
};

export function useBroadcastReportExcel() {
  const [downloading, setDownloading] = useState(false);

  const downloadExcel = async ({ chatId, messageId }: DownloadProps) => {
    if (!chatId || !messageId) {
      showToast({ type: "error", message: "chatId and messageId are required" });
      return;
    }

    try {
      setDownloading(true);

      const res = await api.get<ArrayBuffer>(
        `/wa-accounts/chats/broadcast/report/excel?chatId=${chatId}&messageId=${messageId}`,
        {
          responseType: "arraybuffer",
        }
      );

      const base64Data = Buffer.from(res.data).toString("base64");
      const fileUri = `${FileSystem.cacheDirectory}broadcast-report-${chatId}.xlsx`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }

      showToast({ type: "success", message: "Excel downloaded" });
    } catch (err: any) {
      showToast({ type: "error", message: err?.message || "Excel download failed" });
    } finally {
      setDownloading(false);
    }
  };

  return { downloading, downloadExcel };
}
