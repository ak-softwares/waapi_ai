import { Message } from "@/src/types/Messages";
import { EventType } from "@/src/utils/enums/notification";

export type MessageEvent = {
  message?: Message;
  messageId?: string;
  eventType: EventType;
};

type MessageListener = (event: MessageEvent) => void;

const listeners = new Set<MessageListener>();

export function emitMessage(event: MessageEvent) {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error("Message listener error:", err);
    }
  });
}

export function subscribeMessages(listener: MessageListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}