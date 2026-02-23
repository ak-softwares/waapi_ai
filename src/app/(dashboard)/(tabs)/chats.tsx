import ChatTile from "@/src/component/chats/widgets/ChatTile";
import { useChats } from "@/src/hooks/chat/useChats";
import { useChatStore } from "@/src/store/chatStore";
import { FILTERS } from "@/src/types/Chat";
import { router } from "expo-router";
import { ScrollView } from "moti";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from "react-native";

export default function ChatListScreen() {
  const { chats, loading, loadingMore, loadMore, refreshChats, searchChats, filter, setFilter } = useChats();
  const { activeChat, setActiveChat } = useChatStore();

  const [search, setSearch] = useState("");

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
                style={ styles.chipText }
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
              })
            }

            }
          />
        )}
        // contentContainerStyle={{ paddingBottom: 15 }}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator /> : null
        }
        refreshing={loading}
        onRefresh={refreshChats}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 15,
    // paddingVertical: 0,
    paddingBottom: 10
  },
  searchInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 14,
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
    borderWidth: 0.5,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },

  activeChip: {
    backgroundColor: "#23cf6238",
    borderColor: "transparent",
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

});
