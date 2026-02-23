import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";

const InitialLayout = () => {
  const { isAuthenticated, isReady } = useAuth();
  // const [isAuthenticatedd] = useState(false);
  if (!isReady) return null; // or splash screen

  return (
    <>
      <StatusBar style="dark"/>
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
    <AuthProvider>
      <MenuProvider>
        <InitialLayout />
        <Toast position="bottom" />
      </MenuProvider>
    </AuthProvider>
  );
}
