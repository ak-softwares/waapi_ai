import AiIcon from "@/assets/appIcons/ai.svg";
import ActiveChatIcon from "@/assets/appIcons/chat-active.svg";
import ChatIcon from "@/assets/appIcons/chat.svg";
import SettingActiveIcon from "@/assets/appIcons/setting-active.svg";
import SettingIcon from "@/assets/appIcons/setting.svg";
import TemplateIcon from "@/assets/appIcons/template.svg";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, Tabs } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";


export default function RootLayout() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabLabelActive,
        tabBarInactiveTintColor: colors.tabLabelInactive,

        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
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
        tabBarLabelStyle: {
          marginTop: 5,
        }
      }}
    >
      {/* ================= Chats ================= */}
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarLabel: "Chats", // 🔑 lock tab label
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
                    focused ? colors.tabIconActive : colors.tabIconInactive
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
            <Pressable
              style={styles.addButton}
              onPress={() =>
                router.push("/(dashboard)/template/templateEditor?mode=create")
              }
            >
              {/* <Plus /> */}
              <Text style={styles.addText}>+ Add</Text>
            </Pressable>
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
                  focused ? colors.tabIconActive : colors.tabIconInactive
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
                  focused ? colors.tabIconActive : colors.tabIconInactive
                }
              />
            </View>
          ),
        }}
      />

      {/* ================= Settings ================= */}
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
                    focused ? colors.tabIconActive : colors.tabIconInactive
                  }
                />
              </View>
            );
          },
        }}
      />
    </Tabs>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    addButton: {
      // backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 8,
      marginRight: 12,
    },

    addText: {
      color: colors.primary,
      fontWeight: "600",
    },
  });