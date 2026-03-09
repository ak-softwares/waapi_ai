import { AlertCircle, Download, FileSpreadsheet, Upload } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { useExcelImport } from "@/src/hooks/contacts/useExcelImport";
import { darkColors, lightColors } from "@/src/theme/colors";
import { ImportedContact } from "@/src/types/Contact";

type Props = {
  isAddingBulkContacts: boolean; 
  onImportContacts: (contacts: ImportedContact[]) => Promise<void> | void;
};

export default function ExcelContactsImporter({ isAddingBulkContacts, onImportContacts }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    parseFile,
    importedContacts,
    validContacts,
    isImporting,
    importProgress,
    downloadTemplate,
  } = useExcelImport();

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = useMemo(
    () =>
      importedContacts.filter((contact) => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) {
          return true;
        }

        return (
          (contact.name ?? "").toLowerCase().includes(keyword) ||
          (contact.email ?? "").toLowerCase().includes(keyword) ||
          contact.phones.some((phone) => phone.includes(keyword)) ||
          (contact.tags ?? []).some((tag) => tag.toLowerCase().includes(keyword))
        );
      }),
    [importedContacts, searchTerm]
  );

  const toggleContactSelection = (id: string) => {
    setSelectedContacts((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  };

  const selectAllValid = () => {
    setSelectedContacts(validContacts.map((contact) => contact.id ?? ""));
  };

  const clearSelection = () => {
    setSelectedContacts([]);
  };

  const handleImportSelected = async () => {
    const selected = validContacts.filter((contact) => selectedContacts.includes(contact.id ?? ""));
    await onImportContacts(selected);
  };

  if (importedContacts.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <FileSpreadsheet size={56} color={colors.mutedText} />
        <Text style={styles.title}>Upload Excel/CSV Contacts</Text>
        <Text style={styles.subtitle}>Pick a CSV file with Name, Phones, Tags, Email columns.</Text>

        <Pressable style={styles.primaryBtn} onPress={parseFile}>
          <Upload size={16} color="#fff" />
          <Text style={styles.primaryBtnText}>Choose File</Text>
        </Pressable>

        {isImporting && (
          <View style={styles.progressWrap}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.progressLabel}>Processing... {importProgress}%</Text>
          </View>
        )}

        <Pressable style={styles.linkBtn} onPress={downloadTemplate}>
          <Download size={14} color={colors.primary} />
          <Text style={styles.linkBtnText}>Download Excel Template</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.selectedText}>{selectedContacts.length} selected</Text>
        <View style={styles.toolbarActions}>
          <Pressable style={styles.smallBtn} onPress={selectAllValid}>
            <Text style={styles.smallBtnText}>Select Valid</Text>
          </Pressable>
          <Pressable style={styles.smallBtn} onPress={clearSelection}>
            <Text style={styles.smallBtnText}>Clear</Text>
          </Pressable>
        </View>
      </View>

      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search imported contacts"
        placeholderTextColor={colors.mutedText}
        style={styles.searchInput}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id ?? ""}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isSelected = selectedContacts.includes(item.id ?? "");
          const isInvalid = item.status !== "valid";

          return (
            <Pressable
              onPress={() => !isInvalid && toggleContactSelection(item.id ?? "")}
              style={[
                styles.contactItem,
                isSelected && styles.selectedItem,
                isInvalid && styles.invalidItem,
              ]}
            >
              <View style={styles.contactTop}>
                <Text style={styles.contactName}>{item.name || "Unnamed"}</Text>
                <Text style={styles.contactPhone}>{item.phones.join(", ") || "-"}</Text>
              </View>
              <Text style={styles.contactMeta}>{item.email || "No email"}</Text>
              <Text style={styles.contactMeta}>Tags: {(item?.tags ?? []).join(", ")}</Text>

              {isInvalid && (
                <View style={styles.errorRow}>
                  <AlertCircle size={14} color={colors.error} />
                  <Text style={styles.errorText}>{item.errors?.join(", ")}</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />

      {selectedContacts.length > 0 && (
        <Pressable
          style={[styles.primaryBtn, isAddingBulkContacts && { opacity: 0.7 }]}
          onPress={handleImportSelected}
          disabled={isAddingBulkContacts}
        >
          {isAddingBulkContacts ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Import Selected</Text>
          )}
        </Pressable>
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
    emptyWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      textAlign: "center",
      color: colors.mutedText,
    },
    progressWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    progressLabel: {
      color: colors.mutedText,
      fontSize: 12,
    },
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    toolbarActions: {
      flexDirection: "row",
      gap: 8,
    },
    selectedText: {
      color: colors.text,
      fontWeight: "600",
    },
    smallBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    smallBtnText: {
      fontSize: 12,
      color: colors.text,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    listContainer: {
      gap: 10,
      paddingBottom: 8,
    },
    contactItem: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 12,
      gap: 4,
    },
    selectedItem: {
      borderColor: colors.primary,
    },
    invalidItem: {
      opacity: 0.8,
    },
    contactTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    contactName: {
      color: colors.text,
      fontWeight: "600",
      flex: 1,
    },
    contactPhone: {
      color: colors.text,
      flex: 1,
      textAlign: "right",
    },
    contactMeta: {
      color: colors.mutedText,
      fontSize: 12,
    },
    errorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 4,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      flex: 1,
    },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
      minWidth: 150,
    },
    primaryBtnText: {
      color: "#fff",
      fontWeight: "600",
    },
    linkBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
    },
    linkBtnText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "500",
    },
  });
