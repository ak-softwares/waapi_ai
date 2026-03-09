import ExcelContactsImporter from "@/src/components/contacts/ExcelContactsImporter";
import { useAddContact } from "@/src/hooks/contacts/useAddContact";
import { ImportedContact } from "@/src/types/Contact";
import { router, Stack } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function ExcelImportContactsScreen() {
  const { addingBulkContacts: isAddingBulkContacts, addBulkContacts } = useAddContact(() => {
    router.back();
  });
  // ✅ when import done, merge contacts into broadcast contacts
  const handleExcelImport = async (contacts: ImportedContact[]) => {
    // ✅ send only new unique contacts to API
    await addBulkContacts({ contacts });
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "Import Contacts from Excel" }} />
      <ExcelContactsImporter onImportContacts={handleExcelImport} isAddingBulkContacts={isAddingBulkContacts} />
    </View>
  );
}
