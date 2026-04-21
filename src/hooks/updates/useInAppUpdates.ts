import { useEffect } from "react";
import { Platform } from "react-native";
import InAppUpdates, { IAUUpdateKind } from "sp-react-native-in-app-updates";

const inAppUpdates = new InAppUpdates(false);

export const useInAppUpdates = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const checkForUpdates = async () => {
      try {
        const { shouldUpdate } = await inAppUpdates.checkNeedsUpdate();
        if (!shouldUpdate) return;

        await inAppUpdates.startUpdate({
          updateType: IAUUpdateKind.FLEXIBLE, // or IMMEDIATE
        });
      } catch (error) {
        // console.error("Play Store update check failed:", error);
      }
    };

    checkForUpdates();
  }, []);
};