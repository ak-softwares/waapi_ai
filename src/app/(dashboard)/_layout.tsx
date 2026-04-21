import { FacebookConnectionProvider } from "@/src/context/FacebookConnectionContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useInAppUpdates } from "@/src/hooks/updates/useInAppUpdates";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Stack } from "expo-router";

export default function DashboardLayout() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  useInAppUpdates();

  return (
    <FacebookConnectionProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text, // back button + icons color
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 16,
            color: colors.text,
          },
          headerShadowVisible: false, // remove bottom border
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="messages/messages" />
        <Stack.Screen name="contacts/contacts" />
        <Stack.Screen name="ai/aiAssistant" />
      </Stack>
    </FacebookConnectionProvider>
  );
}