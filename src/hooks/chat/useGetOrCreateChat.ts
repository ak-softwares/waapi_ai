import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { Chat, ChatParticipant } from "@/src/types/Chat";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useState } from "react";

export function useGetOrCreateChat(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const getOrCreateChat = async ({
    participant,
  }: {
    participant: ChatParticipant;
  }) => {
    try {
      setLoading(true);

      const res = await api.post<ApiResponse<Chat>>("/wa-accounts/chats", {
        participant,
      });

      const json = res.data;

      if (!json.success) {
        showToast({
          type: "error",
          message: json.message || "Failed to load chat.",
        });
        return;
      }

      const chat = json.data;

      if (!chat) {
        showToast({
          type: "error",
          message: "Chat not found.",
        });
        return;
      }
      
      onSuccess?.();

      return chat;
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Error creating chat",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getOrCreateChat,
  };
}
