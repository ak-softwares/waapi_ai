import { EventType } from "../utils/enums/notification";
import { Chat } from "./Chat";
import { Message } from "./Messages";

export type NotificationPayload = {
  chat?: Chat;
  message?: Message;
  eventType: EventType;
};