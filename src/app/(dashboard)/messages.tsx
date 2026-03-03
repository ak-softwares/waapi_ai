// MessageScreen.tsx
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import MessageBubble from "@/src/components/messages/widgets/MessageBubble";
import { useMessages } from "@/src/hooks/messages/useMessages";
import { useChatStore } from "@/src/store/chatStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessageScreen() {
  const { chatId } = useLocalSearchParams() as { chatId: string };
  const { activeChat, setActiveChat } = useChatStore();
  
  // const chat = useChatStore((s) => s.getChatById(chatId));
  const inputRef = useRef<TextInput>(null);
  // const chatId = chat?._id!;
  const {
    messages,
    onSend,
    loading,
  } = useMessages({ chatId });

  const [message, setMessage] = useState("");

  const sendMessageHandler = () => {
    if (!message.trim()) return;

    // onSend({
    //   messagePayload: {
    //     message,
    //     chatId,
    //     messageType: "TEXT",
    //     participants: chat?.participants,
    //   },
    // });

    setMessage("");
  };

  if (!chatId) {
    return (
      <View style={styles.center}>
        <Text>Select a chat</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Chat</Text>
        </View>
      </SafeAreaView>

      {/* Messages */}
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item._id!}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ padding: 12 }}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          multiline
          style={styles.input}
        />

        <TouchableOpacity onPress={sendMessageHandler}>
          <Text style={styles.send}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },

  myBubble: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },

  otherBubble: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
  },

  text: {
    fontSize: 16,
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 120,
  },

  send: {
    marginLeft: 10,
    color: "#007AFF",
    fontWeight: "600",
    alignSelf: "center",
  },
});