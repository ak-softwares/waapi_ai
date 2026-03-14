import { configureNotifications } from "@/src/lib/notification/notifications";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

export function usePushNotifications() {

  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

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