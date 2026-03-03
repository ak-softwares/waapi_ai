import ChatTile from "@/src/components/chats/widgets/ChatTile";
import { useTheme } from "@/src/context/ThemeContext";
import { useChats } from "@/src/hooks/chat/useChats";
import { useChatStore } from "@/src/store/chatStore";
import { darkColors, lightColors } from "@/src/theme/colors";
import { FILTERS } from "@/src/types/Chat";
import { router } from "expo-router";
import { ScrollView } from "moti";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function ChatListScreen() {
  const {
    chats,
    loading,
    loadingMore,
    loadMore,
    refreshChats,
    searchChats,
    filter,
    setFilter,
  } = useChats();

  const { setActiveChat } = useChatStore();

  const [search, setSearch] = useState("");

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const handleSearch = (text: string) => {
    setSearch(text);
    searchChats(text);
  };

  return (
    <View style={styles.container}>
      {/* 🔍 Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search chats..."
          placeholderTextColor={colors.placeHolderText}
          cursorColor={colors.cursorColor}
          style={styles.searchInput}
        />
      </View>

      {/* ✅ Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTERS.map((item) => {
          const active = filter === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[
                styles.chip,
                active && styles.activeChip,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  active && { color: colors.primary },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ✅ Chat List */}
      <FlatList
        data={chats}
        keyExtractor={(chat) => chat._id!}
        renderItem={({ item: chat }) => (
          <ChatTile
            chat={chat}
            onPress={() => {
              setActiveChat(chat);
              router.push({
                pathname: "/(dashboard)/messages",
                params: { chatId: chat._id },
              });
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.primary} />
          ) : null
        }
        refreshing={loading}
        onRefresh={refreshChats}
        // style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      />
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    searchContainer: {
      paddingHorizontal: 15,
      paddingBottom: 10,
    },

    searchInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 999,
      paddingHorizontal: 20,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.inputText,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },

    filterContainer: {
      paddingHorizontal: 15,
      gap: 8,
      marginTop: 5,
      marginBottom: 10,
      height: 30,
    },

    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },

    activeChip: {
      backgroundColor: colors.primary + "22", // soft primary
      borderColor: colors.primary + "22",
    },

    chipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
  });