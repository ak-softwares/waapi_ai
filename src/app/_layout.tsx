import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { toastConfig } from "../theme/toastConfig";

const InitialLayout = () => {
  const { isAuthenticated, isReady } = useAuth();
  // const [isAuthenticatedd] = useState(false);
  if (!isReady) return null; // or splash screen
  const { theme } = useTheme();

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
