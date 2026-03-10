import { api } from "@/src/lib/api/apiClient";
import { DeleteMode } from "@/src/utiles/enums/deleteMode";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

interface OnDeletedPayload {
  mode: DeleteMode;
  deletedIds: string[];
}

export function useDeleteChats(onDeleted?: (payload: OnDeletedPayload) => void) {
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Delete Single Chat
  const deleteChat = async (chatId: string) => {
    setIsDeleting(true);

    try {
      const res = await api.delete(`/wa-accounts/chats/${chatId}`);
      const json = res.data;

      if (json.success) {
        showToast({
          type: "success",
          message: "Chat deleted successfully",
        });

        onDeleted?.({
          mode: DeleteMode.Single,
          deletedIds: [chatId],
        });

        return;
      }

      showToast({
        type: "error",
        message: json.message || "Failed to delete chat",
      });
    } catch {
      showToast({
        type: "error",
        message: "Error deleting chat",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Bulk Delete
  const deleteChatsBulk = async (chatIds: string[]) => {
    if (!chatIds.length) {
      showToast({ type: "error", message: "No chats selected." });
      return;
    }

    setIsDeleting(true);

    try {
      const res = await api.delete("/wa-accounts/chats/bulk-delete", {
        data: { ids: chatIds },
      });

      const json = res.data;

      if (json.success) {
        showToast({
          type: "success",
          message: "Selected chats deleted successfully",
        });

        onDeleted?.({
          mode: DeleteMode.Bulk,
          deletedIds: chatIds,
        });

        return;
      }

      showToast({
        type: "error",
        message: json.message || "Failed to delete chats",
      });
    } catch {
      showToast({
        type: "error",
        message: "Error deleting chats",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Delete All Chats
  const deleteAllChats = async () => {
    setIsDeleting(true);

    try {
      const res = await api.delete("/wa-accounts/chats", {
        headers: {
          "x-confirm-delete-all": "true",
        },
      });

      const json = res.data;

      if (json.success) {
        const count = json.data?.deletedCount ?? 0;

        showToast({
          type: "success",
          message:
            count > 0
              ? `${count} chats deleted successfully`
              : "No chats to delete",
        });

        onDeleted?.({
          mode: DeleteMode.All,
          deletedIds: [],
        });

        return;
      }

      showToast({
        type: "error",
        message: json.message || "Failed to delete chats",
      });
    } catch {
      showToast({
        type: "error",
        message: "Error deleting chats",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteChat,
    deleteChatsBulk,
    deleteAllChats,
    isDeleting,
  };
}