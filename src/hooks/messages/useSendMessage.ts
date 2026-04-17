import { api } from "@/src/lib/api/apiClient";
import { emitMessage } from "@/src/lib/events/messageEvents";
import { convertToMetaSendTemplate } from "@/src/lib/mapping/convertToMetaSendTemplate";
import {
    Message,
    MessagePayload,
    MessageStatus,
    MessageType,
} from "@/src/types/Messages";
import { Template } from "@/src/types/Template";
import { EventType } from "@/src/utils/enums/notification";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useState } from "react";

interface SendMessageOptions {
  messagePayload: MessagePayload;
}

export function useSendMessage(onSent?: (message: Message) => void) {
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async ({ messagePayload }: SendMessageOptions) => {
    setIsSending(true);

    const tempId = Date.now().toString();
    // ✅ Optimistic message
    const tempMessage: Message = {
      _id: tempId,
      clientTempId: tempId,
      userId: "me",
      type: messagePayload.messageType,
      message: messagePayload.message,
      media: messagePayload.media,
      chatId: messagePayload?.chatId ?? "",
      from: "me",
      to: messagePayload?.participants?.[0]?.number || "",
      status: MessageStatus.Pending,
      createdAt: new Date().toISOString(),
    };

    // 🔥 Add instantly to UI
    emitMessage({
      eventType: EventType.NEW_MESSAGE,
      message: tempMessage,
      messageId: tempId,
    });

    try {
      // ✅ Template conversion
      if (
        messagePayload.messageType === MessageType.TEMPLATE &&
        messagePayload.template
      ) {
        messagePayload.template = convertToMetaSendTemplate({
          template: messagePayload.template as Template,
        });
      }

      // ✅ attach clientTempId
      messagePayload.clientTempId = tempId;

      // ✅ API call
      const res = await api.post("/wa-accounts/messages", messagePayload);
      const json = res.data;

      if (!json.success) {
        throw new Error(json.message || "Failed to send message");
      }

      const realMessage: Message = json.data.message;
      // 🔥 Callback
      onSent?.(realMessage);

      return realMessage;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong";

      showToast({
        type: "error",
        message: "Error sending message " + error.message,
      });

      return null;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendMessage,
    isSending,
  };
}