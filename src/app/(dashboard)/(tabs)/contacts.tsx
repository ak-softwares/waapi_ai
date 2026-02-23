import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function Contacts() {
  return (
    <>
      <Stack.Screen options={{ title: "Contacts" }} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Contacts</Text>
      </View>
    </>
  );
}
