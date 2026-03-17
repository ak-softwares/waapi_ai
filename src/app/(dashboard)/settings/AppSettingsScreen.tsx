import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { router, Stack } from "expo-router";
import { Bell, Moon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";

import { AppSwitch } from "@/src/components/common/AppSwitch";
import SettingsTile from "@/src/components/settings/widgets/SettingsTile";
import { useTheme } from "@/src/context/ThemeContext";
import { usePushDevice } from "@/src/hooks/notifications/usePushDevice";
import { registerForPushNotificationsAsync } from "@/src/lib/notification/notifications";
import { darkColors, lightColors } from "@/src/theme/colors";
import { showToast } from "@/src/utiles/toastHelper/toast";

const NOTIFICATION_ENABLED_KEY = "notification_enabled";

export default function AppSettingsScreen() {
  const { theme, themeMode } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { registerDevice, unregisterDevice } = usePushDevice();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    const loadNotificationsPreference = async () => {
      const storedValue = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);

      if (storedValue === null) {
        setNotificationsEnabled(true);
        return;
      }

      setNotificationsEnabled(storedValue === "true");
    };

    loadNotificationsPreference();
  }, []);

  const getDeviceId = async () => {
    if (Platform.OS === "android") {
      return Application.getAndroidId();
    }

    if (Platform.OS === "ios") {
      return await Application.getIosIdForVendorAsync();
    }

    return null;
  };

  const updateNotificationSetting = async (nextValue: boolean) => {
    if (toggleLoading) return;

    setToggleLoading(true);
    setNotificationsEnabled(nextValue);

    try {
      const deviceId = await getDeviceId();

      if (!deviceId) {
        throw new Error("Device ID not available");
      }

      if (nextValue) {
        const token = await registerForPushNotificationsAsync();

        if (!token) {
          throw new Error("Push token not available");
        }

        const registered = await registerDevice({ deviceId, token });

        if (!registered) {
          throw new Error("Failed to register push token");
        }
      } else {
        const unregistered = await unregisterDevice(deviceId);

        if (!unregistered) {
          throw new Error("Failed to unregister push token");
        }
      }

      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, String(nextValue));

      showToast({
        type: "success",
        message: nextValue
          ? "Notifications enabled"
          : "Notifications disabled",
      });
    } catch {
      setNotificationsEnabled(!nextValue);

      showToast({
        type: "error",
        message: "Failed to update notification setting",
      });
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SettingsTile
          icon={<Bell size={22} color={colors.primary} />}
          title="Notifications"
          subtitle={notificationsEnabled ? "Enabled" : "Disabled"}
          onPress={() => updateNotificationSetting(!notificationsEnabled)}
          onLongPress={() => router.push("/(dashboard)/profile/notificationDebug")}
          rightElement={(
            <AppSwitch
              value={notificationsEnabled}
              onValueChange={updateNotificationSetting}
              disabled={toggleLoading}
              colors={colors}
            />
          )}
        />
        <SettingsTile
          icon={<Moon size={22} color={colors.primary} />}
          title="Theme"
          subtitle={`Current: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`}
          onPress={() => router.push("/(dashboard)/settings/ThemeScreen")}
        />
      </ScrollView>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 12,
    },
  });
