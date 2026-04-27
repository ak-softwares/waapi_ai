import { useEffect } from "react";
import { Platform } from "react-native";
import InAppUpdates, {
  IAUInstallStatus,
  IAUUpdateKind,
  StatusUpdateEvent,
} from "sp-react-native-in-app-updates";

const inAppUpdates = new InAppUpdates(false);

export const useInAppUpdates = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    // ✅ Listen for download completion and trigger install
    const handleStatusUpdate = (event: StatusUpdateEvent) => {
      if (event.status === IAUInstallStatus.DOWNLOADED) {
        // Update has finished downloading — now prompt user to install
        inAppUpdates.installUpdate();
      }
    };

    inAppUpdates.addStatusUpdateListener(handleStatusUpdate);

    const checkForUpdates = async () => {
      try {
        const { shouldUpdate } = await inAppUpdates.checkNeedsUpdate();
        if (!shouldUpdate) return;

        await inAppUpdates.startUpdate({
          updateType: IAUUpdateKind.FLEXIBLE,
        });
      } catch (error) {
        // handle error
      }
    };

    checkForUpdates();

    // ✅ Always clean up the listener
    return () => {
      inAppUpdates.removeStatusUpdateListener(handleStatusUpdate);
    };
  }, []);
};