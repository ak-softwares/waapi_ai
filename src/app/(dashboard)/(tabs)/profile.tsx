import { useAuth } from "@/src/context/AuthContext";
import { Stack } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Profile() {
  const { logout } = useAuth();
  
  return (
    <>
      <Stack.Screen options={{ title: "Profile" }} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Profile Screen</Text>
        <Button title="Logout" onPress={logout} >

        </Button>
      </View>
    </>
  );
}
