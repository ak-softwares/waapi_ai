import ActiveChatIcon from "@/assets/appIcons/chat-active.svg";
import ChatIcon from "@/assets/appIcons/chat.svg";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        // headerShown: false,
        tabBarActiveTintColor: "#1DAA57",
        tabBarInactiveTintColor: "#999",
        tabBarShowLabel: false,   // ✅ force label
        // tabBarActiveTintColor: "#0B8576",
        headerShadowVisible: false,   // ✅ removes bottom border

        // headerStyle: {
        //   backgroundColor: "#100692", // header background
        // },
        tabBarIconStyle: {
          marginTop: 6,
        },

        // headerTintColor: "#b91e1e", // icon + text color

        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* ✅ Scanner Icon */}
              <TouchableOpacity
                // onPress={() => router.push("/scanner")}
                style={{ marginRight: 14 }}
              >
                <Ionicons name="qr-code-outline" size={22} />
              </TouchableOpacity>
              <Menu>
                <MenuTrigger>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={22}
                    style={{ marginRight: 12 }}
                  />
                </MenuTrigger>

                <MenuOptions>
                  <MenuOption onSelect={() => alert("New Chat")} text="New Chat" />
                  <MenuOption onSelect={() => alert("Archived")} text="Archived" />
                  <MenuOption onSelect={() => alert("Settings")} text="Settings" />
                </MenuOptions>
              </Menu>
            </View>
          ),
          // tabBarShowLabel: false, // 👈 hides text
          // tabBarLabelStyle: {
          //   fontSize: 12,   // increase size here
          //   fontWeight: "600",
          // },
          tabBarIcon: ({ color, size, focused }) => {
            const Icon = focused ? ActiveChatIcon : ChatIcon;
            return (
              <View
                // style={{
                //   backgroundColor: focused ? "#26cc6b73" : "transparent",
                //   borderRadius: 20,
                //   paddingVertical: 5,
                //   paddingHorizontal: 10,
                //   alignItems: "center",
                //   justifyContent: "center",
                // }}
              >
                <Icon
                  width={size}
                  height={size}
                  fill={focused ? "#038338" : "#a0af9c"}
                />
              </View>
          )},
        }}
      />

      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
