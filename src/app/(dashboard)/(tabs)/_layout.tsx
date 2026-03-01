import AiIcon from "@/assets/appIcons/ai.svg";
import ActiveChatIcon from "@/assets/appIcons/chat-active.svg";
import ChatIcon from "@/assets/appIcons/chat.svg";
import SettingActiveIcon from "@/assets/appIcons/setting-active.svg";
import SettingIcon from "@/assets/appIcons/setting.svg";
import TemplateIcon from "@/assets/appIcons/template.svg";
import { useTheme } from "@/src/context/ThemeContext";

import { darkColors, lightColors } from "@/src/theme/colors";
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
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabLabelActive,
        tabBarInactiveTintColor: colors.tabLabelInactive,

        tabBarStyle: {
          height: 70,
          backgroundColor: colors.tabBackground,
          borderTopWidth: 0,
        },

        headerStyle: {
          backgroundColor: colors.headerBackground,
        },

        headerTitleStyle: {
          color: colors.text,
          fontWeight: "600",
        },

        headerShadowVisible: false,
        tabBarShowLabel: true,

        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      {/* ================= Chats ================= */}
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",

          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity style={{ marginRight: 14 }}>
                <Ionicons
                  name="qr-code-outline"
                  size={22}
                  color={colors.headerIcon}
                />
              </TouchableOpacity>

              <Menu>
                <MenuTrigger>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={22}
                    color={colors.headerIcon}
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

          tabBarLabelStyle: {
            marginTop: 4,
            fontSize: 10,
          },

          tabBarIcon: ({ size, focused }) => {
            const Icon = focused ? ActiveChatIcon : ChatIcon;

            return (
              <View
                style={{
                  backgroundColor: focused
                    ? colors.tabIconBgActive
                    : "transparent",
                  borderRadius: 20,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  width={size}
                  height={size}
                  fill={
                    focused
                      ? colors.tabIconActive
                      : colors.tabIconInactive
                  }
                />
              </View>
            );
          },
        }}
      />

      {/* ================= Templates ================= */}
      <Tabs.Screen
        name="templates"
        options={{
          title: "Templates",
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity style={{ marginRight: 14 }}>
                <Ionicons
                  name="add-circle"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          ),
          tabBarLabelStyle: {
            marginTop: 4,
            fontSize: 10,
          },

          tabBarIcon: ({ size, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? colors.tabIconBgActive
                  : "transparent",
                borderRadius: 20,
                paddingVertical: 5,
                paddingHorizontal: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TemplateIcon
                width={size}
                height={size}
                fill={
                  focused
                    ? colors.tabIconActive
                    : colors.tabIconInactive
                }
              />
            </View>
          ),
        }}
      />

      {/* ================= AI ================= */}
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",

          tabBarLabelStyle: {
            marginTop: 4,
            fontSize: 10,
          },

          tabBarIcon: ({ size, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? colors.tabIconBgActive
                  : "transparent",
                borderRadius: 20,
                paddingVertical: 5,
                paddingHorizontal: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AiIcon
                width={size}
                height={size}
                fill={
                  focused
                    ? colors.tabIconActive
                    : colors.tabIconInactive
                }
              />
            </View>
          ),
        }}
      />

      {/* ================= Profile ================= */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",

          tabBarLabelStyle: {
            marginTop: 4,
            fontSize: 10,
          },

          tabBarIcon: ({ size, focused }) => {
             const Icon = focused ? SettingActiveIcon : SettingIcon;
            return (
            <View
              style={{
                backgroundColor: focused
                  ? colors.tabIconBgActive
                  : "transparent",
                borderRadius: 20,
                paddingVertical: 5,
                paddingHorizontal: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                width={size}
                height={size}
                fill={
                  focused
                    ? colors.tabIconActive
                    : colors.tabIconInactive
                }
              />
            </View>
          )},
        }}
      />
    </Tabs>
  );
}