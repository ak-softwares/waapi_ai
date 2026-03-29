import { configureNotifications } from "@/src/lib/notification/notifications";
import { NotificationPayload } from "@/src/types/Notification";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

export function usePushNotifications() {

  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as NotificationPayload;

      // if (data?.chat) {
      //   emitChatUpdate(data.chat);
      // }
      // if (data?.message) {
      //   emitMessage(data.message);
      // }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      // if (data?.chat) {
      //   emitChatUpdate(data.chat as Chat); // 🔥 IMPORTANT
      // }

      if (!data?.chatId) return;

      router.push({
        pathname: "/(dashboard)/(tabs)/chats",
        // params: {
        //   chatId: data.chatId,
        //   chatData: JSON.stringify(data.chat),
        // },
      });
    });
    return () => {
      responseListener.remove();
    };

  }, []);

}