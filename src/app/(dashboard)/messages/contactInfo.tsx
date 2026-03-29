import ContactInfoPage from "@/src/components/messages/widgets/ContactInfoPage";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Chat, ChatType } from "@/src/types/Chat";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Info } from "lucide-react-native";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function ContactInfoScreen() {
  const params = useLocalSearchParams<{ chat?: string }>();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const chat = useMemo<Chat | null>(() => {
    if (!params.chat) return null;

    try {
      return JSON.parse(params.chat) as Chat;
    } catch {
      return null;
    }
  }, [params.chat]);

  const handleEditBroadcast = () => {
    if (!chat || chat.type !== ChatType.BROADCAST) {
      return;
    }

    router.push({
      pathname: "/(dashboard)/broadcast/broadcast",
      params: {
        mode: "edit",
        broadcastId: chat._id,
        broadcastName: chat.chatName ?? "",
        participants: JSON.stringify(chat.participants ?? []),
      },
    });
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Contact info",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
              <ArrowLeft size={22} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {chat 
        ? (
            <ContactInfoPage chat={chat} onEditBroadcast={handleEditBroadcast} />
          ) 
        : 
          (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, paddingHorizontal: 20 }}>
              <Info size={22} color={colors.mutedText} />
              <Text style={{ color: colors.mutedText, marginTop: 8, textAlign: "center" }}>
                Unable to load contact details for this chat.
              </Text>
            </View>
          )
      }
    </>
  );
}
