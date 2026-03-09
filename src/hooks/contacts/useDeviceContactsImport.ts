import { ImportedContact } from "@/src/types/Contact";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useCallback, useMemo, useState } from "react";

const normalizePhone = (phone: string) => {
  try {
    const parsed = parsePhoneNumberFromString(phone, "IN");

    if (!parsed || !parsed.isValid()) return null;

    return parsed.number.slice(1); // remove "+"
  } catch {
    return null;
  }
};

export function useDeviceContactsImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);

  const importFromDeviceContacts = useCallback(async () => {
    try {
      setIsImporting(true);

      const Contacts = await import("expo-contacts");

      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        showToast({
          type: "error",
          message: "Permission denied to access contacts",
        });
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      const globalPhones = new Set<string>();
      const results: ImportedContact[] = new Array(data.length);

      for (let i = 0; i < data.length; i++) {
        const contact = data[i];

        const name = (contact.name ?? "").trim();
        const email = (contact.emails?.[0]?.email ?? "").trim();

        const rawPhone = contact.phoneNumbers?.[0]?.number ?? "";

        const errors: string[] = [];
        const phones: string[] = [];

        let status: ImportedContact["status"] = "valid";

        if (!name) {
          status = "invalid";
          errors.push("Name missing");
        }

        if (!rawPhone) {
          status = "invalid";
          errors.push("Phone missing");
        }

        const normalized = normalizePhone(rawPhone);

        if (!normalized) {
          status = "invalid";
          errors.push(`Invalid phone: ${rawPhone}`);
        } else if (globalPhones.has(normalized)) {
          status = "duplicate";
          errors.push(`Duplicate phone: ${normalized}`);
        } else {
          globalPhones.add(normalized);
          phones.push(normalized);
        }

        results[i] = {
          id: contact.id ?? `${i}`,
          name,
          email,
          phones,
          tags: ["Device Import"],
          status,
          errors: errors.length ? errors : undefined,
        };
      }

      setImportedContacts(results);

      showToast({
        type: "success",
        message: `Imported ${results.length} contacts`,
      });
    } catch {
      showToast({
        type: "error",
        message: "Failed to import device contacts",
      });
    } finally {
      setIsImporting(false);
    }
  }, []);

  const validContacts = useMemo(
    () => importedContacts.filter((c) => c.status === "valid"),
    [importedContacts]
  );

  return {
    importFromDeviceContacts,
    importedContacts,
    validContacts,
    isImporting,
  };
}