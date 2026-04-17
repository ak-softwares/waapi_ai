import { useAddContact } from "@/src/hooks/contacts/useAddContact";
import { useDeviceContactsImport } from "@/src/hooks/contacts/useDeviceContactsImport";
import { ImportedContact } from "@/src/types/Contact";
import { showToast } from "@/src/utils/toastHelper/toast";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";

export default function ImportPhoneContactsScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { importFromDeviceContacts, importedContacts, validContacts, isImporting } =
    useDeviceContactsImport();

  const { addingBulkContacts: isAddingBulkContacts, addBulkContacts } = useAddContact(() => {
    router.back();
  });

  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  useEffect(() => {
    importFromDeviceContacts();
  }, [importFromDeviceContacts]);

  const selectedCount = selectedContactIds.length;

  const selectedContacts = useMemo(
    () => validContacts.filter((contact) => selectedContactIds.includes(contact.id ?? "")),
    [validContacts, selectedContactIds]
  );

  const toggleSelect = (contact: ImportedContact) => {
    if (contact.status !== "valid") return;

    setSelectedContactIds((previous) =>
      previous.includes(contact.id ?? "")
        ? previous.filter((id) => id !== contact.id)
        : [...previous, contact.id ?? ""]
    );
  };

  const selectAllValid = () => {
    setSelectedContactIds(validContacts.map((contact) => contact.id ?? ""));
  };

  const clearSelection = () => {
    setSelectedContactIds([]);
  };

  const handleImportSelected = async () => {
    if (selectedContacts.length === 0) {
      showToast({ type: "error", message: "No valid contacts selected" });
      return;
    }

    await addBulkContacts({
      contacts: selectedContacts,
    });
  };

  const renderItem = ({ item }: { item: ImportedContact }) => {
    const selected = selectedContactIds.includes(item.id ?? "");
    const isInvalid = item.status !== "valid";

    return (
      <Pressable
        onPress={() => toggleSelect(item)}
        style={[
          styles.contactItem,
          selected && styles.selectedItem,
          isInvalid && styles.invalidItem,
        ]}
      >
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name || "Unnamed"}</Text>

          <Text style={styles.contactPhone}>
            {item.phones?.join(", ") || "No phone"}
          </Text>

          {item.errors?.length ? (
            <Text style={styles.errorText}>{item.errors.join(", ")}</Text>
          ) : null}
        </View>

        <Text style={styles.checkmark}>{selected ? "✓" : ""}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Import from Phone" }} />

      {isImporting ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      ) : (
        <>
          <View style={styles.toolbar}>
            <Text style={styles.countText}>Found: {importedContacts.length}</Text>

            <View style={styles.actions}>
              <Pressable style={styles.smallBtn} onPress={selectAllValid}>
                <Text style={styles.smallBtnText}>Select Valid</Text>
              </Pressable>

              <Pressable style={styles.smallBtn} onPress={clearSelection}>
                <Text style={styles.smallBtnText}>Clear</Text>
              </Pressable>
            </View>
          </View>

          <FlatList
            data={importedContacts}
            keyExtractor={(item) => item.id ?? ""}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />

          {selectedCount > 0 && (
            <Pressable
              style={[
                styles.primaryBtn,
                isAddingBulkContacts && { opacity: 0.7 },
              ]}
              disabled={isAddingBulkContacts}
              onPress={handleImportSelected}
            >
              {isAddingBulkContacts ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  Import Selected ({selectedCount})
                </Text>
              )}
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
      gap: 12,
    },

    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    loadingText: {
      color: colors.mutedText,
      fontSize: 13,
    },

    toolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    countText: {
      color: colors.text,
      fontWeight: "600",
    },

    actions: {
      flexDirection: "row",
      gap: 8,
    },

    smallBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },

    smallBtnText: {
      fontSize: 12,
      color: colors.text,
    },

    listContainer: {
      gap: 10,
      paddingBottom: 10,
    },

    contactItem: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },

    contactInfo: {
      flex: 1,
      gap: 3,
    },

    selectedItem: {
      borderColor: colors.primary,
    },

    invalidItem: {
      opacity: 0.7,
    },

    contactName: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 14,
    },

    contactPhone: {
      color: colors.mutedText,
      fontSize: 12,
    },

    errorText: {
      color: colors.error,
      fontSize: 12,
    },

    checkmark: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
    },

    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      minWidth: 150,
    },

    primaryBtnText: {
      color: "#fff",
      fontWeight: "600",
    },
  });