import SearchBar from "@/src/components/common/search/SearchBar";
import { useTheme } from "@/src/context/ThemeContext";
import { useBroadcast } from "@/src/hooks/broadcast/useBroadcast";
import { useContacts } from "@/src/hooks/contacts/useContacts";
import { useDeviceContactsImport } from "@/src/hooks/contacts/useDeviceContactsImport";
import { useExcelImport } from "@/src/hooks/contacts/useExcelImport";
import { emitChat } from "@/src/lib/events/chatEvents";
import { darkColors, lightColors } from "@/src/theme/colors";
import { ChatParticipant } from "@/src/types/Chat";
import { Contact, ImportedContact } from "@/src/types/Contact";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type SourceMode = "broadcast" | "contacts" | "excel" | "device";

const chunkToParticipants = (contacts: ImportedContact[]): ChatParticipant[] =>
  contacts
    .map((contact) => ({
      name: contact.name,
      number: contact.phones?.[0] ?? "",
      imageUrl: contact.imageUrl,
    }))
    .filter((contact) => Boolean(contact.number));

const contactToParticipant = (contact: Contact): ChatParticipant | null => {
  const number = contact.phones?.[0] ?? "";

  if (!number) {
    return null;
  }

  return {
    name: contact.name,
    number,
    imageUrl: contact.imageUrl,
  };
};

export default function BroadcastScreen() {
  const params = useLocalSearchParams<{
    mode?: string;
    broadcastId?: string;
    broadcastName?: string;
    participants?: string;
  }>();

  const isEditMode = params.mode === "edit" && Boolean(params.broadcastId);

  const initialParticipants = useMemo<ChatParticipant[]>(() => {
    if (!params.participants) return [];

    try {
      const parsed = JSON.parse(params.participants);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [params.participants]);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const [sourceMode, setSourceMode] = useState<SourceMode>("broadcast");
  const [broadcastName, setBroadcastName] = useState(
      params.broadcastName?.trim() ? params.broadcastName : "Broadcast List"
    );
  const [participants, setParticipants] = useState<ChatParticipant[]>(initialParticipants);

  const [contactSearch, setContactSearch] = useState("");
  const [excelSearch, setExcelSearch] = useState("");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [audienceSearch, setAudienceSearch] = useState("");
  const [selectedContactNumbers, setSelectedContactNumbers] = useState<string[]>([]);

  const [selectedExcelIds, setSelectedExcelIds] = useState<string[]>([]);
  const [deviceSelection, setDeviceSelection] = useState<string[]>([]);

  const { contacts, loading, loadingMore, hasMore, loadMore, searchContacts, refreshContacts } = useContacts();

  const { createBroadcast, creatingBroadcast, updateBroadcast, updatingBroadcast } = useBroadcast(() => {
    setBroadcastName("");
    setParticipants([]);
  });

  const {
    parseFile,
    importedContacts,
    validContacts,
    isImporting,
    importProgress,
    downloadTemplate,
  } = useExcelImport();

  const {
    importFromDeviceContacts,
    importedContacts: importedDeviceContacts,
    validContacts: validDeviceContacts,
    isImporting: importingDeviceContacts,
  } = useDeviceContactsImport();

  useEffect(() => {
    if (sourceMode === "device" && importedDeviceContacts.length === 0 && !importingDeviceContacts) {
      importFromDeviceContacts();
    }
  }, [sourceMode, importedDeviceContacts.length, importingDeviceContacts, importFromDeviceContacts]);

  useEffect(() => {
    if (sourceMode === "contacts") {
      refreshContacts();
    }
  }, [sourceMode]);



  const canCreate = broadcastName.trim().length > 0
      && participants.length > 0
      && !creatingBroadcast
      && !updatingBroadcast;

  const mergeParticipants = (incoming: ChatParticipant[]) => {
    setParticipants((previous) => {
      const known = new Set(previous.map((participant) => participant.number));
      const uniqueIncoming = incoming.filter((participant) => {
        if (!participant.number || known.has(participant.number)) {
          return false;
        }

        known.add(participant.number);
        return true;
      });

      return [...previous, ...uniqueIncoming];
    });
  };

  const handleSaveBroadcast = async () => {
    if (isEditMode && params.broadcastId) {
      const chat = await updateBroadcast({
        broadcastId: params.broadcastId,
        broadcastName,
        participants,
      });

      if (chat?._id) {
        router.back();
      }
      return;
    }

    const chat = await createBroadcast({
      broadcastName,
      participants,
    });

    if (chat?._id) {
      emitChat(chat);
      router.back();
      // router.push({ pathname: "/(dashboard)/messages", params: { chatId: chat._id } });
    }
  };

  const handleSearchContacts = (value: string) => {
    setContactSearch(value);
    searchContacts(value);
  };

  const toggleContactSelection = (number: string) => {
    setSelectedContactNumbers((previous) =>
      previous.includes(number)
        ? previous.filter((item) => item !== number)
        : [...previous, number]
    );
  };

  const addSelectedContactsToCampaign = () => {
    const selected = contacts
      .filter((contact) => selectedContactNumbers.includes(contact.phones?.[0] ?? ""))
      .map((contact) => contactToParticipant(contact))
      .filter((participant): participant is ChatParticipant => Boolean(participant));

    mergeParticipants(selected);
    setSelectedContactNumbers([]);
    setSourceMode("broadcast");
  };

  const addExcelToCampaign = () => {
    const selected = validContacts.filter((contact) => selectedExcelIds.includes(contact.id ?? ""));
    mergeParticipants(chunkToParticipants(selected));
    setSelectedExcelIds([]);
    setSourceMode("broadcast");
  };

  const addDeviceContactsToCampaign = () => {
    const selected = validDeviceContacts.filter((contact) =>
      deviceSelection.includes(contact.id ?? "")
    );

    mergeParticipants(chunkToParticipants(selected));
    setDeviceSelection([]);
    setSourceMode("broadcast");
  };

  const filteredExcelContacts = importedContacts.filter((c) =>
    (c.name || "")
      .toLowerCase()
      .includes(excelSearch.toLowerCase()) ||
    (c.phones?.[0] || "").includes(excelSearch)
  );

  const filteredDeviceContacts = importedDeviceContacts.filter((c) =>
    (c.name || "")
      .toLowerCase()
      .includes(deviceSearch.toLowerCase()) ||
    (c.phones?.[0] || "").includes(deviceSearch)
  );

  const filteredParticipants = participants.filter((p) =>
    (p.name || "")
      .toLowerCase()
      .includes(audienceSearch.toLowerCase()) ||
    (p.number || "").includes(audienceSearch)
  );

  const renderContactsMode = () => (
    <View style={styles.sourceContainer}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarText}>Selected: {selectedContactNumbers.length}</Text>
        <View style={styles.row}>
          <Pressable
            style={styles.smallButton}
            onPress={() =>
              setSelectedContactNumbers(
                contacts.map((contact) => contact.phones?.[0] ?? "").filter(Boolean)
              )
            }
          >
            <Text style={styles.smallButtonText}>Select visible</Text>
          </Pressable>
          <Pressable style={styles.smallButton} onPress={() => setSelectedContactNumbers([])}>
            <Text style={styles.smallButtonText}>Clear</Text>
          </Pressable>
        </View>
      </View>
      {/* Search Bar */}
      <SearchBar
        value={contactSearch}
        placeholder="Search contact list..."
        onSearch={handleSearchContacts}
        disablePadding={true}
      />
      <FlatList
        data={contacts}
        keyExtractor={(item, index) => item._id ?? `${item.phones?.[0] ?? item.name}-${index}`}
        onEndReached={() => hasMore && loadMore()}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 18 }} />
          ) : (
            <Text style={styles.emptyText}>No contacts found.</Text>
          )
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} /> : null
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const number = item.phones?.[0] ?? "";
          const checked = selectedContactNumbers.includes(number);

          return (
            <Pressable
              disabled={!number}
              onPress={() => toggleContactSelection(number)}
              style={[styles.itemCard, checked && styles.itemCardSelected]}
            >
              <Text style={styles.itemTitle}>{item.name || "Unnamed"}</Text>
              <Text style={styles.itemSubtitle}>{number || "No number"}</Text>
            </Pressable>
          );
        }}
      />

      <Pressable
        style={styles.primaryButton}
        onPress={addSelectedContactsToCampaign}
        disabled={!selectedContactNumbers.length}
      >
        <Text style={styles.primaryButtonText}>
          Add {selectedContactNumbers.length} from contact list
        </Text>
      </Pressable>
    </View>
  );

  const renderExcelMode = () => (
    <View style={styles.sourceContainer}>
      {importedContacts.length === 0 ? (
        <View style={styles.centeredBlock}>
          <Pressable style={styles.primaryButton} onPress={parseFile}>
            <Text style={styles.primaryButtonText}>Choose Excel / CSV</Text>
          </Pressable>

          {isImporting && (
            <Text style={styles.mutedText}>Processing file... {importProgress}%</Text>
          )}

          <Pressable style={styles.smallButton} onPress={downloadTemplate}>
            <Text style={styles.smallButtonText}>Download template</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.toolbar}>
            <Text style={styles.toolbarText}>Valid contacts: {validContacts.length}</Text>
            <View style={styles.row}>
              <Pressable
                style={styles.smallButton}
                onPress={() => setSelectedExcelIds(validContacts.map((contact) => contact.id ?? ""))}
              >
                <Text style={styles.smallButtonText}>Select all valid</Text>
              </Pressable>
              <Pressable style={styles.smallButton} onPress={() => setSelectedExcelIds([])}>
                <Text style={styles.smallButtonText}>Clear</Text>
              </Pressable>
            </View>
          </View>
          {/* Search Bar */}
          <SearchBar
            value={excelSearch}
            placeholder="Search imported contacts..."
            onSearch={setExcelSearch}
            disablePadding={true}
          />
          <FlatList
            data={filteredExcelContacts}
            keyExtractor={(item, index) => item.id ?? `${item.name}-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const selected = selectedExcelIds.includes(item.id ?? "");
              const invalid = item.status !== "valid";

              return (
                <Pressable
                  disabled={invalid}
                  onPress={() =>
                    setSelectedExcelIds((previous) =>
                      previous.includes(item.id ?? "")
                        ? previous.filter((id) => id !== item.id)
                        : [...previous, item.id ?? ""]
                    )
                  }
                  style={[styles.itemCard, selected && styles.itemCardSelected, invalid && { opacity: 0.6 }]}
                >
                  <Text style={styles.itemTitle}>{item.name || "Unnamed"}</Text>
                  <Text style={styles.itemSubtitle}>{item.phones.join(", ") || "No number"}</Text>
                </Pressable>
              );
            }}
          />

          <Pressable style={styles.primaryButton} onPress={addExcelToCampaign}>
            <Text style={styles.primaryButtonText}>Add {selectedExcelIds.length} from Excel</Text>
          </Pressable>
        </>
      )}
    </View>
  );

  const renderDeviceMode = () => (
    <View style={styles.sourceContainer}>
      {importingDeviceContacts ? (
        <View style={styles.centeredBlock}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.mutedText}>Loading phone contacts...</Text>
        </View>
      ) : (
        <>
          <View style={styles.toolbar}>
            <Text style={styles.toolbarText}>Valid contacts: {validDeviceContacts.length}</Text>
            <View style={styles.row}>
              <Pressable
                style={styles.smallButton}
                onPress={() => setDeviceSelection(validDeviceContacts.map((contact) => contact.id ?? ""))}
              >
                <Text style={styles.smallButtonText}>Select all valid</Text>
              </Pressable>
              <Pressable style={styles.smallButton} onPress={() => setDeviceSelection([])}>
                <Text style={styles.smallButtonText}>Clear</Text>
              </Pressable>
            </View>
          </View>
          {/* Search Bar */}
          <SearchBar
            value={deviceSearch}
            placeholder="Search phone contacts..."
            onSearch={setDeviceSearch}
            disablePadding={true}
          />
          <FlatList
            data={filteredDeviceContacts}
            keyExtractor={(item, index) => item.id ?? `${item.name}-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const selected = deviceSelection.includes(item.id ?? "");
              const invalid = item.status !== "valid";

              return (
                <Pressable
                  disabled={invalid}
                  onPress={() =>
                    setDeviceSelection((previous) =>
                      previous.includes(item.id ?? "")
                        ? previous.filter((id) => id !== item.id)
                        : [...previous, item.id ?? ""]
                    )
                  }
                  style={[styles.itemCard, selected && styles.itemCardSelected, invalid && { opacity: 0.6 }]}
                >
                  <Text style={styles.itemTitle}>{item.name || "Unnamed"}</Text>
                  <Text style={styles.itemSubtitle}>{item.phones.join(", ") || "No number"}</Text>
                </Pressable>
              );
            }}
          />

          <Pressable style={styles.primaryButton} onPress={addDeviceContactsToCampaign}>
            <Text style={styles.primaryButtonText}>Add {deviceSelection.length} from phone</Text>
          </Pressable>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditMode ? "Edit Broadcast" : "Broadcast Campaign",
        }}
      />

      <View style={styles.header}>
        <Text style={styles.label}>Campaign / Broadcast Name</Text>
        <TextInput
          value={broadcastName}
          onChangeText={setBroadcastName}
          placeholder="Enter campaign name"
          placeholderTextColor={colors.placeHolderText}
          style={styles.input}
        />

        <View style={styles.sourceButtonsRow}>
          <Pressable style={styles.smallButton} onPress={() => setSourceMode("contacts")}>
            <Text style={styles.smallButtonText}>Import Contact</Text>
          </Pressable>
          <Pressable style={styles.smallButton} onPress={() => setSourceMode("excel")}>
            <Text style={styles.smallButtonText}>Import Excel</Text>
          </Pressable>
          <Pressable style={styles.smallButton} onPress={() => setSourceMode("device")}>
            <Text style={styles.smallButtonText}>Phone Contacts</Text>
          </Pressable>
        </View>
      </View>

      {sourceMode === "contacts" && renderContactsMode()}
      {sourceMode === "excel" && renderExcelMode()}
      {sourceMode === "device" && renderDeviceMode()}

      {sourceMode === "broadcast" && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>
            Audience Size ({participants.length})
          </Text>
          {/* Search Bar */}
          <SearchBar
            value={audienceSearch}
            placeholder="Search contacts..."
            onSearch={setAudienceSearch}
            disablePadding={true}
          />
          <FlatList
            data={filteredParticipants}
            keyExtractor={(item) => `${item.number}-${item.name}`}
            // style={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <View style={styles.previewRow}>
                <View style={styles.previewLeft}>
                  <Text style={styles.itemTitle}>
                    {item.name || item.number}
                  </Text>

                  {item.name && (
                    <Text style={styles.itemSub}>
                      {item.number}
                    </Text>
                  )}
                </View>

                <Pressable
                  onPress={() =>
                    setParticipants((previous) =>
                      previous.filter((p) => p.number !== item.number)
                    )
                  }
                >
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      )}

      <View style={styles.footer}>
        {sourceMode !== "broadcast" ? (
          <Pressable style={styles.secondaryButton} onPress={() => setSourceMode("broadcast")}>
            <Text style={styles.secondaryButtonText}>Back to summary</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.primaryButton, !canCreate && { opacity: 0.5 }]}
            disabled={!canCreate}
            onPress={handleSaveBroadcast}
          >
            <Text style={styles.primaryButtonText}>
              {creatingBroadcast || updatingBroadcast
                ? isEditMode
                  ? "Updating campaign..."
                  : "Creating campaign..."
                : isEditMode
                  ? "Update Broadcast Campaign"
                  : "Create Broadcast Campaign"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 10,
      gap: 10,
    },
    label: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.inputText,
    },
    sourceButtonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      flexWrap: "wrap",
    },
    sourceContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 10,
    },
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    toolbarText: {
      color: colors.text,
      fontWeight: "600",
    },
    row: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap",
    },
    smallButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    smallButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "500",
    },
    listContent: {
      paddingBottom: 10,
      gap: 8,
    },
    itemCard: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 10,
      gap: 3,
    },
    itemCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "1A",
    },
    itemTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    itemSubtitle: {
      color: colors.mutedText,
      fontSize: 12,
    },
    summaryContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 10,
    },
    summaryTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    summaryCount: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 22,
    },
    bulkInput: {
      minHeight: 100,
      textAlignVertical: "top",
    },
    previewRow: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    previewLeft: {
      flex: 1,
    },

    itemSub: {
      fontSize: 13,
      color: colors.mutedText,
      marginTop: 2,
    },
    removeText: {
      color: colors.error,
      fontWeight: "600",
      fontSize: 12,
    },
    footer: {
      // borderTopWidth: 1,
      // borderTopColor: colors.border,
      padding: 14,
      backgroundColor: colors.background,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    primaryButtonText: {
      color: "#fff",
      fontWeight: "700",
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "600",
    },
    centeredBlock: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    mutedText: {
      color: colors.mutedText,
      fontSize: 12,
    },
    emptyText: {
      textAlign: "center",
      color: colors.mutedText,
      marginTop: 20,
    },
  });
