import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { Chat, ChatParticipant } from "@/src/types/Chat";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useState } from "react";

type CreateProps = {
  broadcastName: string;
  participants: ChatParticipant[];
};

type UpdateProps = {
  broadcastId: string;
  broadcastName?: string;
  participants?: ChatParticipant[];
};

export function useBroadcast(onSuccess?: () => void) {
  const [creatingBroadcast, setCreatingBroadcast] = useState(false);
  const [updatingBroadcast, setUpdatingBroadcast] = useState(false);

  const createBroadcast = async ({
    broadcastName,
    participants,
  }: CreateProps) => {
    if (!broadcastName.trim()) {
      showToast({ type: "error", message: "Please enter broadcast name." });
      return;
    }

    if (!participants.length) {
      showToast({ type: "error", message: "Please select at least one contact." });
      return;
    }

    try {
      setCreatingBroadcast(true);

      const res = await api.post<ApiResponse<Chat>>(
        "/wa-accounts/chats/broadcast",
        {
          broadcastName,
          participants,
        }
      );

      const json = res.data;

      if (!json.success || !json.data) {
        showToast({
          type: "error",
          message: json.message || "Failed to create broadcast.",
        });
        return;
      }

      onSuccess?.();

      showToast({ type: "success", message: "Broadcast list created." });
      return json.data;
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Broadcast creation failed.",
      });
    } finally {
      setCreatingBroadcast(false);
    }
  };

  const updateBroadcast = async ({
    broadcastId,
    broadcastName,
    participants,
  }: UpdateProps) => {
    if (!participants?.length) {
      showToast({ type: "error", message: "Please select at least one contact." });
      return;
    }

    try {
      setUpdatingBroadcast(true);

      const res = await api.put<ApiResponse<Chat>>(
        "/wa-accounts/chats/broadcast",
        {
          broadcastId,
          broadcastName,
          participants,
        }
      );

      const json = res.data;

      if (!json.success || !json.data) {
        showToast({
          type: "error",
          message: json.message || "Failed to update broadcast.",
        });
        return;
      }

      onSuccess?.();

      showToast({ type: "success", message: "Broadcast updated." });
      return json.data;
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Broadcast update failed.",
      });
    } finally {
      setUpdatingBroadcast(false);
    }
  };

  return {
    creatingBroadcast,
    updatingBroadcast,
    createBroadcast,
    updateBroadcast,
  };
}
