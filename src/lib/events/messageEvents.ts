import { Message } from "@/src/types/Messages";

type MessageListener = (message: Message) => void;

const listeners = new Set<MessageListener>();

export function emitMessage(message: Message) {
  listeners.forEach((l) => l(message));
}

export function subscribeMessages(listener: MessageListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}