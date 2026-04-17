import { usePushNotifications } from "@/src/hooks/notifications/usePushNotifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import {
  OnboardingProvider,
  useOnboarding
} from "../context/OnboardingContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { usePusher } from "../hooks/realtime/usePusher";
import { toastConfig } from "../theme/toastConfig";
const InitialLayout = () => {
  const {
    hasCompletedOnboarding,
    isReady: isOnboardingReady,
  } = useOnboarding();
  const { isAuthenticated, isReady } = useAuth();
  const { theme } = useTheme();
  usePushNotifications();
  usePusher();

  if (!isReady || !isOnboardingReady) return null;
  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!hasCompletedOnboarding}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected
          guard={
            hasCompletedOnboarding && isAuthenticated
          }
        >
          <Stack.Screen name="(dashboard)" />
        </Stack.Protected>

        <Stack.Protected
          guard={
            hasCompletedOnboarding && !isAuthenticated
          }
        >
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
};

export default function RootLayout() {

  return (
    <ThemeProvider>
      <KeyboardProvider>
        <OnboardingProvider>
          <AuthProvider>
            <MenuProvider>
              <InitialLayout />
              <Toast config={toastConfig} />
            </MenuProvider>
          </AuthProvider>
        </OnboardingProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
