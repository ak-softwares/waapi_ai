import { ImportedContact } from "@/src/types/Contact";
import { showToast } from "@/src/utiles/toastHelper/toast";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
};

const parseCsv = (csvContent: string): Record<string, string>[] => {
  const normalized = csvContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length <= 1) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });
};

export function useExcelImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);

  const parseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const file = result.assets[0];

      setIsImporting(true);
      setImportProgress(10);

      let rows: Record<string, string>[] = [];

      // -------- CSV ----------
      if (file.name?.toLowerCase().endsWith(".csv")) {
        const csvText = await FileSystem.readAsStringAsync(file.uri);
        rows = parseCsv(csvText);
      }

      // -------- EXCEL ----------
      else if (
        file.name?.toLowerCase().endsWith(".xlsx") ||
        file.name?.toLowerCase().endsWith(".xls")
      ) {
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const workbook = XLSX.read(base64, { type: "base64" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        rows = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
        }) as Record<string, string>[];
      }

      setImportProgress(40);

      const seenPhones = new Set<string>();

      const parsed = rows.map((row, index) => {
        const name = (row.Name ?? row.name ?? "").trim();
        const email = (row.Email ?? row.email ?? "").trim();
        const phonesRaw = (row.Phones ?? row.phones ?? "").trim();
        const tagsRaw = (row.Tags ?? row.tags ?? "").trim();

        const tags = Array.from(
          new Set([
            "Excel Import",
            ...tagsRaw
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          ])
        );

        const phones = phonesRaw
          .split(/[,\s]+/)
          .map((p) => p.trim())
          .filter(Boolean);

        const errors: string[] = [];
        let status: ImportedContact["status"] = "valid";

        if (!name) {
          status = "invalid";
          errors.push("Name missing");
        }

        if (phones.length === 0) {
          status = "invalid";
          errors.push("Phone missing");
        }

        const validPhones: string[] = [];

        phones.forEach((phone) => {
          if (phone.length < 7) {
            status = "invalid";
            errors.push(`Invalid phone: ${phone}`);
            return;
          }

          if (seenPhones.has(phone)) {
            status = "duplicate";
            errors.push(`Duplicate phone: ${phone}`);
            return;
          }

          seenPhones.add(phone);
          validPhones.push(phone);
        });

        return {
          id: `${index + 1}`,
          name,
          email,
          phones: validPhones,
          tags,
          status,
          errors: errors.length ? errors : undefined,
        } as ImportedContact;
      });

      setImportProgress(90);
      setImportedContacts(parsed);

      showToast({
        type: "success",
        message: `Processed ${parsed.length} contacts`,
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to parse file",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(100);
      setTimeout(() => setImportProgress(0), 800);
    }
  };

  const downloadTemplate = async () => {
    try {
      const templateData = [
        {
          Name: "John Doe",
          Phones: "919876543210",
          Tags: "Remarketing",
          Email: "john@example.com",
        },
        {
          Name: "Jane Smith",
          Phones: "919876543211",
          Tags: "Loyal customers",
          Email: "jane@example.com",
        },
      ];

      // create worksheet
      const worksheet = XLSX.utils.json_to_sheet(templateData, {
        header: ["Name", "Phones", "Tags", "Email"],
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

      // convert to base64
      const base64 = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });

      const fileUri = FileSystem.cacheDirectory + "contacts_template.xlsx";

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);

      showToast({
        type: "success",
        message: "Template downloaded successfully",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to download template",
      });
    }
  };

  const validContacts = useMemo(
    () => importedContacts.filter((contact) => contact.status === "valid"),
    [importedContacts]
  );

  const invalidContacts = useMemo(
    () => importedContacts.filter((contact) => contact.status !== "valid"),
    [importedContacts]
  );

  return {
    parseFile,
    isImporting,
    importProgress,
    importedContacts,
    validContacts,
    invalidContacts,
    downloadTemplate,
  };
}
