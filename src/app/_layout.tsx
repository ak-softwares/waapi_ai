import { usePushNotifications } from "@/src/hooks/notifications/usePushNotifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { usePusher } from "../hooks/realtime/usePusher";
import { toastConfig } from "../theme/toastConfig";

const InitialLayout = () => {
  const { isAuthenticated, isReady } = useAuth();
  const { theme } = useTheme();
  usePushNotifications();
  usePusher();

  if (!isReady) return null;

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(dashboard)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
};

export default function RootLayout() {

  return (
    <ThemeProvider>
        <AuthProvider>
          <MenuProvider>
            <InitialLayout />
            <Toast config={toastConfig} />
          </MenuProvider>
        </AuthProvider>
    </ThemeProvider>
  );
}
