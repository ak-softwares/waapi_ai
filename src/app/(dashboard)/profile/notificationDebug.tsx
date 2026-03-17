import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";

import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { usePushDevice } from "@/src/hooks/notifications/usePushDevice";
import { darkColors, lightColors } from "@/src/theme/colors";
import { showToast } from "@/src/utiles/toastHelper/toast";
import Constants from "expo-constants";

function getExpoProjectId() {
  const easProjectIdFromConfig = Constants?.expoConfig?.extra?.eas?.projectId;
  const easProjectIdFromRuntime = Constants?.easConfig?.projectId;

  return easProjectIdFromRuntime ?? easProjectIdFromConfig ?? undefined;
}

export default function NotificationDebugScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { registerDevice } = usePushDevice();

  const [deviceId, setDeviceId] = useState<string>("-");
  const [pushToken, setPushToken] = useState<string>("-");
  const [realDevice, setRealDevice] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Notification Debug",
    });
  }, [navigation]);

  useEffect(() => {
    const loadPushData = async () => {
      try {
        addLog("Step 1: Checking device type");

        const isReal = Device.isDevice;
        setRealDevice(isReal);

        addLog(`Device.isDevice = ${isReal}`);

        if (!isReal) {
          addLog("❌ Not a real device. Push token cannot be generated.");
          return;
        }

        addLog("Step 2: Checking notification permission");

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        addLog(`Existing permission: ${existingStatus}`);

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          addLog("Requesting permission...");

          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;

          addLog(`Permission result: ${status}`);
        }

        if (finalStatus !== "granted") {
          addLog("❌ Permission not granted");
          return;
        }

        addLog("Step 3: Getting EAS projectId");

        const projectId = getExpoProjectId();

        addLog(`ProjectId: ${projectId ?? "undefined"}`);

        addLog("Step 4: Generating Expo Push Token");

        const token = (
          await Notifications.getExpoPushTokenAsync(
            projectId ? { projectId } : undefined
          )
        ).data;

        addLog("✅ Token generated");

        setPushToken(token);

        addLog(`Token preview: ${token.slice(0, 30)}...`);

        addLog("Step 5: Getting device ID");

        if (Platform.OS === "android") {
          const androidId = Application.getAndroidId() ?? "-";
          setDeviceId(androidId);
          addLog(`Android ID: ${androidId}`);
          return;
        }

        if (Platform.OS === "ios") {
          const iosId = await Application.getIosIdForVendorAsync();
          setDeviceId(iosId ?? "-");
          addLog(`iOS ID: ${iosId}`);
          return;
        }

        addLog("Unsupported platform");
      } catch (err: any) {
        addLog(`❌ Error: ${err?.message || "Unknown error"}`);
      }
    };

    loadPushData();
  }, []);

  const copyToClipboard = async (value: string, label: string) => {
    await Clipboard.setStringAsync(value);

    showToast({
      type: "success",
      message: `${label} copied`,
    });
  };

  const onRegisterDebugNotification = async () => {
    if (!pushToken || pushToken === "-") {
      showToast({
        type: "error",
        message: "Push token not generated",
      });
      return;
    }

    setDebugLoading(true);

    try {
      addLog("Registering push token to backend...");

      const saved = await registerDevice({
        deviceId,
        token: pushToken,
      });

      addLog(`Backend response: ${saved ? "success" : "failed"}`);

      showToast({
        type: saved ? "success" : "error",
        message: saved
          ? "Notification registered"
          : "Failed to save notification token",
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Register notification failed";

      addLog(`❌ Register error: ${message}`);

      showToast({
        type: "error",
        message,
      });
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.debugCard}>
        <Text style={styles.debugTitle}>Push Notification Debug</Text>

        <Text style={styles.debugLabel}>
          Real Device: {realDevice ? "YES" : "NO"}
        </Text>

        <Text style={styles.debugLabel}>Device ID</Text>
        <View style={styles.valueRow}>
          <Text style={styles.debugValue}>{deviceId}</Text>

          <TouchableOpacity
            onPress={() => copyToClipboard(deviceId, "Device ID")}
          >
            <Ionicons name="copy-outline" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.debugLabel}>Push Token</Text>
        <View style={styles.valueRow}>
          <Text style={styles.debugValue} numberOfLines={3} selectable>
            {pushToken}
          </Text>

          <TouchableOpacity
            onPress={() => copyToClipboard(pushToken, "Push Token")}
          >
            <Ionicons name="copy-outline" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
              opacity: debugLoading ? 0.6 : 1,
            },
          ]}
          onPress={onRegisterDebugNotification}
          disabled={debugLoading}
        >
          <Text style={styles.buttonText}>
            {debugLoading ? "Registering..." : "Register Notification"}
          </Text>
        </TouchableOpacity>

        {/* Debug Logs */}

        <View style={styles.logContainer}>
          <Text style={styles.debugLabel}>Debug Logs</Text>

          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.background,
      minHeight: "100%",
    },

    debugCard: {
      marginTop: 16,
      marginBottom: 24,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 8,
    },

    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },

    debugTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },

    debugLabel: {
      color: colors.mutedText,
      fontSize: 12,
      marginTop: 2,
    },

    debugValue: {
      color: colors.text,
      fontSize: 12,
      flex: 1,
    },

    button: {
      marginTop: 10,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },

    buttonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14,
    },

    logContainer: {
      marginTop: 16,
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingTop: 10,
      gap: 4,
    },

    logText: {
      fontSize: 11,
      color: colors.text,
    },
  });