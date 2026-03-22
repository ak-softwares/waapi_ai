import AppMenu from "@/src/components/common/AppMenu";
import ConfirmSheet from "@/src/components/common/ConfirmSheet";
import { useTheme } from "@/src/context/ThemeContext";
import { useGetOrCreateChat } from "@/src/hooks/chat/useGetOrCreateChat";
import { useContacts } from "@/src/hooks/contacts/useContacts";
import { useDeleteContacts } from "@/src/hooks/contacts/useDeleteContacts";
import { useExportContacts } from "@/src/hooks/contacts/useExportContacts";
import { darkColors, lightColors } from "@/src/theme/colors";
import { ChatParticipant } from "@/src/types/Chat";
import { Contact } from "@/src/types/Contact";
import { DeleteMode } from "@/src/utiles/enums/deleteMode";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { router, Stack } from "expo-router";
import {
  ArrowLeft,
  Check,
  Download,
  Import,
  Megaphone,
  MoreVertical,
  Phone,
  Search,
  Trash2,
  UserPlus,
  X
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import ContactTile from "./widgets/ContactTile";

export default function ContactsScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    contacts,
    setContacts,
    totalContacts,
    loading,
    loadingMore,
    hasMore,
    refreshContacts,
    loadMore,
    searchContacts,
  } = useContacts();

  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { exportContacts } = useExportContacts();
  const [deleteMode, setDeleteMode] = useState<DeleteMode | null>(null);
  const [targetContact, setTargetContact] = useState<Contact | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const { getOrCreateChat } = useGetOrCreateChat();
  const { deleteContact, deleteContactsBulk, deleteAllContacts, isDeleting } =
    useDeleteContacts(({ mode, deletedIds }) => {

      if (mode === DeleteMode.All) {
        setContacts([]);
      }

      if (mode === DeleteMode.Bulk) {
        setSelectedContacts([]);
        setIsSelectionMode(false);
      }

      if (mode === DeleteMode.Single) {
        setSelectedContacts((prev) =>
          prev.filter((c) => !deletedIds.includes(c._id ?? ""))
        );
      }

      setContacts((prev) =>
        prev.filter((c) => !deletedIds.includes(c._id ?? ""))
      );

      setShowDelete(false);
      setTargetContact(null);
      setDeleteMode(null);
    });

    
  const selectedIds = useMemo(
    () => new Set(selectedContacts.map((contact) => contact._id)),
    [selectedContacts]
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    searchContacts(value);
  };

  const handleOpenAddContactDialog = () => {
    router.push({
      pathname: "/(dashboard)/contacts/addContact",
    });
  };

  const handleChatContact = (contact: Contact) => {
    if (!contact?._id) {
      showToast({
        type: "error",
        message: "Contact id missing",
      });
      return;
    }
    const participant: ChatParticipant = {
      name: contact.name,
      number: contact.phones[0],
      imageUrl: contact.imageUrl
    }

    getOrCreateChat({participant});
    router.back();
  };

  const handleEditContact = (contact: Contact) => {
    if (!contact?._id) {
      showToast({
        type: "error",
        message: "Contact id missing",
      });
      return;
    }

    router.push({
      pathname: "/(dashboard)/contacts/addContact",
      params: {
        id: contact._id,
        contactData: JSON.stringify(contact),
      },
    });
  };

  const handleDeleteContact = (contact: Contact) => {
    setTargetContact(contact);
    setDeleteMode(DeleteMode.Single);
    setShowDelete(true);
  };

  const handleDeleteSelected = () => {
    if (!selectedContacts.length) {
      showToast({ type: "error", message: "No contacts selected." });
      return;
    }

    setDeleteMode(DeleteMode.Bulk);
    setShowDelete(true);
  };

  const handleDeleteAllContacts = () => {
    setDeleteMode(DeleteMode.All);
    setShowDelete(true);
  };

  const clearSelection = () => {
    setSelectedContacts([]);
    setIsSelectionMode(false);
  };

  const handleExport = () => {
    const count = selectedContacts.length;
    if (!count) {
      showToast({ type: "error", message: "No contacts selected." });
      return;
    }
    exportContacts(selectedContacts);
    clearSelection();
  };

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts((prev) =>
      prev.some((item) => item._id === contact._id)
        ? prev.filter((item) => item._id !== contact._id)
        : [...prev, contact]
    );
  };

  const selectAllContacts = () => setSelectedContacts(contacts);

  const renderContact = ({ item: contact }: { item: Contact }) => {
    const isSelected = selectedIds.has(contact._id);

    return (
      <ContactTile
        contact={contact}
        isSelected={isSelected}
        isSelectionMode={isSelectionMode}
        onPress={() =>
          isSelectionMode ? toggleContactSelection(contact) : handleEditContact(contact)
        }
        onLongPress={() => {
          setIsSelectionMode(true);
          toggleContactSelection(contact);
        }}
        onChat={() => handleChatContact(contact)}
        onEdit={() => handleEditContact(contact)}
        onDelete={() => handleDeleteContact(contact)}
        onTagPress={handleSearch}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isSelectionMode ? `Selected (${selectedContacts.length})` : `Contacts (${totalContacts})`,
          
          headerLeft: () => (
            <View style={{ paddingRight: 10 }}>
              {isSelectionMode 
              ?
                <TouchableOpacity onPress={clearSelection}>
                  <X size={22} color={colors.text} />
                </TouchableOpacity>
              :
                <TouchableOpacity onPress={() => router.back()}>
                  <ArrowLeft size={22} color={colors.text} />
                </TouchableOpacity>
              }
            </View>
          ),

          headerRight: () => (
            <View>
              {isSelectionMode
                ? <View style={styles.selectionActionsRight}>
                    <TouchableOpacity onPress={selectAllContacts} style={styles.iconAction}>
                      <Check size={18} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleExport} style={styles.iconAction}>
                      <Download size={18} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteSelected} style={styles.iconAction}>
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                : <View style={styles.selectionActionsRight}>
                    <TouchableOpacity onPress={handleOpenAddContactDialog}>
                      <UserPlus size={18} color={colors.text} />
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
                          label: "Import from Phone",
                          icon: <Phone size={16} color={colors.text} />,
                          onPress: () => {
                            router.push({
                              pathname: "/(dashboard)/contacts/phoneImport",
                            });
                          }
                        },
                        {
                          label: "Excel Import",
                          icon: <Import size={16} color={colors.text} />,
                          onPress: () => {
                            router.push({
                              pathname: "/(dashboard)/contacts/excelImport",
                            });
                          }
                        },
                        {
                          label: "Delete All",
                          icon: <Trash2 size={16} color={colors.error} />,
                          onPress: handleDeleteAllContacts,
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
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.placeHolderText} />
          <TextInput
            value={searchValue}
            onChangeText={handleSearch}
            placeholder="Search contacts..."
            placeholderTextColor={colors.placeHolderText}
            cursorColor={colors.cursorColor}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={contacts}
          keyExtractor={(contact, index) => contact._id || `${contact.phones[0]}-${index}`}
          renderItem={renderContact}
          refreshing={loading}
          onRefresh={refreshContacts}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasMore) {
              loadMore();
            }
          }}
          ListEmptyComponent={
            loading ? null : <Text style={styles.emptyText}>No contacts found.</Text>
          }
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={colors.primary} /> : null
          }
        />

        <ConfirmSheet
          visible={showDelete}
          title={
            deleteMode === DeleteMode.Single
              ? "Delete contact?"
              : deleteMode === DeleteMode.Bulk
              ? "Delete selected contacts?"
              : "Delete all contacts?"
          }
          description="This action cannot be undone."
          confirmText="Delete"
          loading={isDeleting}
          onCancel={() => setShowDelete(false)}
          onConfirm={async () => {
            if (deleteMode === DeleteMode.Single && targetContact) {
              await deleteContact(targetContact._id ?? "", targetContact.name);
            }

            if (deleteMode === DeleteMode.Bulk) {
              const ids = selectedContacts.map((c) => c._id ?? "");
              await deleteContactsBulk(ids);
            }

            if (deleteMode === DeleteMode.All) {
              await deleteAllContacts();
            }
            clearSelection();
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
      paddingHorizontal: 10,
      paddingTop: 10,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    count: {
      color: colors.mutedText,
      fontSize: 14,
      fontWeight: "500",
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    selectionBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginBottom: 10,
      backgroundColor: colors.surface,
    },
    selectionInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    selectionAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    selectionActionText: {
      color: colors.text,
      fontWeight: "500",
      fontSize: 13,
    },
    selectionCount: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 14,
    },
    selectionActionsRight: {
      flexDirection: "row",
      gap: 8,
    },
    iconAction: {
      padding: 6,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 12,
      marginBottom: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 11,
      color: colors.text,
      fontSize: 14,
    },
    listContainer: {
      paddingBottom: 30,
      gap: 8,
    },
    emptyText: {
      textAlign: "center",
      color: colors.mutedText,
      marginTop: 60,
      fontSize: 15,
    },
    contactCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    contactCardSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}1A`,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: `${colors.primary}26`,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 16,
    },
    contactContent: {
      flex: 1,
      gap: 4,
    },
    contactName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    contactPhone: {
      color: colors.mutedText,
      fontSize: 13,
      lineHeight: 19,
    },
    selectedBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 2,
    },
    tagChip: {
      backgroundColor: `${colors.primary}22`,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tagText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "500",
    },
  });