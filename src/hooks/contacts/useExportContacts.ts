import { Contact } from "@/src/types/Contact";
import { showToast } from "@/src/utiles/toastHelper/toast";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

export const useExportContacts = () => {
  const exportContacts = async (selectedContacts: Contact[]) => {
    if (!selectedContacts || selectedContacts.length === 0) {
      showToast({ type: "error", message: "No contacts selected for export" });
      return;
    }

    try {
      const formattedContacts = selectedContacts.map((c) => ({
        Name: c.name || "",
        Email: c.email || "",
        Phones: c.phones?.join(", ") || "",
        Tags: c.tags?.join(", ") || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedContacts);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

      const base64 = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });

      const fileUri = FileSystem.cacheDirectory + "contacts_export.xlsx";

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);

      // showToast({ type: "success", message: "Contacts exported successfully" });
    } catch (error) {
      showToast({ type: "error", message: "Failed to export contacts" });
    }
  };

  return { exportContacts };
};