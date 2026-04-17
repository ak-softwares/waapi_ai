import ChatTile from "@/src/components/chats/widgets/ChatTile";
import AppMenu from "@/src/components/common/AppMenu";
import ConfirmSheet from "@/src/components/common/ConfirmSheet";
import FloatingButton from "@/src/components/common/FloatingButton";
import SearchBar from "@/src/components/common/search/SearchBar";
import UserShimmer from "@/src/components/common/user/UserShimmer";
import { useTheme } from "@/src/context/ThemeContext";
import { useChats } from "@/src/hooks/chat/useChats";
import { useDeleteChats } from "@/src/hooks/chat/useDeleteChats";
import { useFavourite } from "@/src/hooks/chat/useFavourite";
import { useFacebookConnectionStatus } from "@/src/hooks/setup/useFacebookConnectionStatus";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Chat, FILTERS } from "@/src/types/Chat";
import { DeleteMode } from "@/src/utils/enums/deleteMode";
import { showToast } from "@/src/utils/toastHelper/toast";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Check, Heart, Megaphone, MoreVertical, Trash2, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
    FlatList, ScrollView, StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import FacebookConnectCard from "../setup/widgets/FacebookConnectCard";

export default function ChatListScreen() {
  const { refresh } = useLocalSearchParams();

  const {
    chats,
    loading,
    loadingMore,
    loadMore,
    refreshChats,
    searchChats,
    filter,
    setFilter,
    setChats,
  } = useChats();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Chat[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteMode | null>(null);
  const { toggleFavourite } = useFavourite();
  const { isLoadingFacebookStatus, isFacebookConnected } = useFacebookConnectionStatus();
  
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { deleteChatsBulk, deleteAllChats, isDeleting } = useDeleteChats(({ mode, deletedIds }) => {
    if (mode === DeleteMode.All) {
      setChats([]);
    } else {
      setChats((prev) =>
        prev.filter((chat) => !deletedIds.includes(chat._id ?? ""))
      );
    }

    setSelectedChats([]);
    setIsSelectionMode(false);
    setShowDeleteConfirm(false);
  });


  useEffect(() => {
    if (refresh) refreshChats();
  }, [refresh]);

  const selectedIds = useMemo(
    () => new Set(selectedChats.map((chat) => chat._id ?? "")),
    [selectedChats]
  );

  const filteredChats = useMemo(() => {
    if (filter === "unread") {
      return chats.filter((chat) => (chat.unreadCount ?? 0) > 0);
    }

    if (filter === "broadcast") {
      return chats.filter((chat) => chat.type === "broadcast");
    }

    if (filter === "favourite") {
      return chats.filter((chat) => Boolean(chat.isFavourite));
    }

    return chats;
  }, [chats, filter]);

  const toggleChatSelection = (chat: Chat) => {
    setSelectedChats((prev) =>
      prev.some((item) => item._id === chat._id)
        ? prev.filter((item) => item._id !== chat._id)
        : [...prev, chat]
    );
  };

  const clearSelection = () => {
    setSelectedChats([]);
    setIsSelectionMode(false);
  };

  const handleDeleteSelected = () => {
    if (!selectedChats.length) {
      showToast({ type: "error", message: "No chats selected." });
      return;
    }

    setDeleteMode(DeleteMode.Bulk);
    setShowDeleteConfirm(true);
  };

  const handleDeleteAll = () => {
    setDeleteMode(DeleteMode.All);
    setShowDeleteConfirm(true);
  };

  const selectedChat = selectedChats.length === 1 ? selectedChats[0] : null;

  const handleToggleFavourite = async () => {
    if (!selectedChat?._id) return;

    const newState = await toggleFavourite(selectedChat._id);

    if (newState !== null) {

      // update chats list
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, isFavourite: newState }
            : chat
        )
      );

      // 🔥 update selected chats so header icon refreshes immediately
      setSelectedChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, isFavourite: newState }
            : chat
        )
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: isSelectionMode
            ? `Selected (${selectedChats.length})`
            : "Chats",

          headerLeft: () => (
            <View style={{ paddingRight: 10 }} >
              {isSelectionMode 
              ?
                <TouchableOpacity onPress={clearSelection} style={{ paddingLeft: 10 }} >
                  <X size={22} color={colors.text} />
                </TouchableOpacity>
              :
                undefined
              }
            </View>
          ),

          headerRight: () => (
            <View style= {{ paddingRight: 10}}>
              {isSelectionMode
                ? <View style={styles.selectionActionsRight}>
                    {selectedChats.length === 1 && (
                      <TouchableOpacity onPress={handleToggleFavourite} style={styles.iconAction}>
                        <Heart
                          size={20}
                          color={selectedChat?.isFavourite ? "red" : colors.text}
                          fill={selectedChat?.isFavourite ? "red" : "transparent"}
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setSelectedChats([...filteredChats])} style={styles.iconAction}>
                      <Check size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteSelected} style={styles.iconAction}>
                      <Trash2 size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                : <View style={styles.selectionActionsRight}>
                    <TouchableOpacity>
                      <Ionicons
                        name="qr-code-outline"
                        size={22}
                        color={colors.headerIcon}
                      />
                    </TouchableOpacity>

                    <AppMenu
                      trigger={<MoreVertical size={22} color={colors.text} />}
                      items={[
                        {
                          label: "Make Broadcast",
                          icon: <Megaphone size={16} color={colors.text} />,
                          onPress: () => {
                            router.push({
                              pathname: "/(dashboard)/broadcast/broadcast",
                            });
                          }
                        },
                        {
                          label: "Delete All",
                          icon: <Trash2 size={16} color={colors.error} />,
                          onPress: handleDeleteAll,
                        },
                      ]}
                    />
                  </View>
              }
            </View>
          ),
        }}
      />

      <View style={styles.container}>

        <View style={styles.upperSection}>
          <SearchBar
            placeholder="Search chats..."
            onSearch={searchChats}
          />
          
          <View>
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
                    onPress={() => {
                      if (filter === item.key) {
                        refreshChats();
                      } else {
                        setFilter(item.key);
                      }
                    }}
                    style={[styles.chip, active && styles.activeChip]}
                  >
                    <Text style={[styles.chipText, active && { color: colors.primary }]}> 
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
            {!isFacebookConnected && !isLoadingFacebookStatus && (
              <FacebookConnectCard
                colors={colors}
                onPress={() => router.push("/(dashboard)/setup/WhatsAppSetupScreen")}
                subtitle="Connect WhatsApp Cloud API before using chats."
              />
            )}
        </View>

        <FlatList
          data={loading ? [] : filteredChats}
          keyExtractor={(item) =>
            item._id || `${item.createdAt}-${item.lastMessageAt}`
          }
          ListEmptyComponent={
            loading ? <UserShimmer count={10} /> : <Text style={styles.emptyText}>No chats found.</Text>
          }
          renderItem={({ item: chat }) => (
            <ChatTile
              chat={chat}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.has(chat._id ?? "")}
              onLongPress={() => {
                setIsSelectionMode(true);
                toggleChatSelection(chat);
              }}
              onPress={() => {
                if (isSelectionMode) {
                  toggleChatSelection(chat);
                  return;
                }

                router.push({
                  pathname: "/(dashboard)/messages/messages",
                  params: { 
                    chatId: chat._id,
                    chatData: JSON.stringify(chat), 
                  },
                });
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <UserShimmer count={2} /> : null}
          refreshing={loading}
          onRefresh={refreshChats}
          style={{ paddingHorizontal: 10 }}
        />
        

        {!isSelectionMode && (
          <FloatingButton
            onPress={() => router.push("/(dashboard)/contacts/contacts")}
          />
        )}

        <ConfirmSheet
          visible={showDeleteConfirm}
          title={deleteMode === "all" ? "Delete all chats?" : "Delete selected chats?"}
          description="This action cannot be undone."
          confirmText="Delete"
          loading={isDeleting}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteMode(null);
          }}
          onConfirm={() => {
            if (deleteMode === "all") {
              deleteAllChats();
            } else {
              deleteChatsBulk(selectedChats.map((chat) => chat._id ?? ""));
            }
          }}
          colors={colors}
        />
      </View>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    upperSection: {
      paddingHorizontal: 10,
    },
    selectionBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 14,
      marginTop: 6,
      marginBottom: 10,
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    selectionInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    selectionText: {
      color: colors.text,
      fontWeight: "600",
    },
    selectionActionsRight: {
      flexDirection: "row",
      gap: 8,
    },
    iconAction: {
      padding: 6,
    },

    filterContainer: {
      paddingHorizontal: 5,
      gap: 8,
      marginTop: 5,
      marginBottom: 10,
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
      backgroundColor: colors.primary + "22",
      borderColor: colors.primary + "22",
    },
    chipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    emptyText: {
      marginTop: 50,
      textAlign: "center",
      color: colors.mutedText,
    },
  });