"use client";

import { api } from "@/src/lib/api/apiClient";
import { DeleteMode } from "@/src/utils/enums/deleteMode";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useState } from "react";

interface OnDeletedPayload {
  mode: DeleteMode;
  deletedIds: string[];
}

export function useDeleteMessages(onDeleted?: (payload: OnDeletedPayload) => void) {
  const [isDeleting, setIsDeleting] = useState(false);


  const deleteMessage = async (messageId: string) => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/wa-accounts/messages/${messageId}`);
      const json = res.data;

      if (json.success) {
        showToast({
          type: "success",
          message: "Message deleted successfully",
        });

        onDeleted?.({
          mode: DeleteMode.Single,
          deletedIds: [messageId],
        });

        return true;
      }

      showToast({
        type: "error",
        message: json.message || "Failed to delete message",
      });

      return false;
    } catch(e) {
      // console.error("Error deleting message:", e);
      showToast({
        type: "error",
        message: "Error deleting message",
      });

      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteMessagesBulk = async (selectedMessages: string[]) => {
    if (!selectedMessages.length) {
      showToast({ type: "error", message: "No messages selected." });
      return false;
    }
    setIsDeleting(true);

    try {
      const res = await api.delete("/wa-accounts/messages/bulk-delete", {
        data: { ids: selectedMessages },
      });

      const json = res.data;

      if (json.success) {
        showToast({
          type: "success",
          message: "Selected messages deleted successfully",
        });

        onDeleted?.({
          mode: DeleteMode.Bulk,
          deletedIds: selectedMessages,
        });

        return true;
      }

      showToast({
        type: "error",
        message: json.message || "Failed to delete selected messages",
      });

      return false;
    } catch {
      showToast({
        type: "error",
        message: "Error deleting selected messages",
      });

      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteMessage,
    deleteMessagesBulk,
    isDeleting,
  };
}
