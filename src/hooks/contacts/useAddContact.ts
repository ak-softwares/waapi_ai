import { api } from "@/src/lib/api/apiClient";
import { ImportedContact } from "@/src/types/Contact";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

export function useAddContact(onSuccess?: () => void) {
  const [addingContact, setAddingContact] = useState(false);
  const [addingBulkContacts, setAddingBulkContacts] = useState(false);
  const [updatingContact, setUpdatingContact] = useState(false);

  const addContact = async ({ contact }: { contact: ImportedContact }) => {
    try {
      setAddingContact(true);

      const res = await api.post("/wa-accounts/contacts", {
        contact,
      });

      const json = res.data;

      if (!json?.success) {
        showToast({
          type: "error",
          message: json?.message || "Failed to save contact",
        });
        return false;
      }

      showToast({
        type: "success",
        message: "Contact saved successfully",
      });

      onSuccess?.();
      return true;
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Error saving contact",
      });
      return false;
    } finally {
      setAddingContact(false);
    }
  };

  const addBulkContacts = async ({
    contacts,
  }: {
    contacts: ImportedContact[];
  }) => {
    if (!contacts.length) {
      showToast({
        type: "error",
        message: "No valid contacts selected",
      });
      return false;
    }

    try {
      setAddingBulkContacts(true);

      const res = await api.post("/wa-accounts/contacts/bulk", {
        contacts,
      });

      const data = res.data;

      if (!data?.success) {
        showToast({
          type: "error",
          message: data?.message || "Failed to upload contacts",
        });
        return false;
      }

      const uploaded = data.data?.uploadedCount || 0;
      const skipped = data.data?.skippedCount || 0;

      if (uploaded > 0) {
        showToast({
          type: "success",
          message: `Uploaded ${uploaded} contacts`,
        });
      }

      if (skipped > 0) {
        showToast({
          type: "info",
          message: `${skipped} contacts skipped`,
        });
      }

      onSuccess?.();
      return true;
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Failed to upload contacts",
      });
      return false;
    } finally {
      setAddingBulkContacts(false);
    }
  };

  const updateContact = async ({ contact }: { contact: ImportedContact }) => {
    if (!contact.id) {
      showToast({
        type: "error",
        message: "Contact id missing",
      });
      return false;
    }

    try {
      setUpdatingContact(true);

      const res = await api.put(`/wa-accounts/contacts/${contact.id}`, {
        contact,
      });

      const json = res.data;

      if (!json?.success) {
        showToast({
          type: "error",
          message: json?.message || "Failed to update contact",
        });
        return false;
      }

      showToast({
        type: "success",
        message: "Contact updated successfully",
      });

      onSuccess?.();
      return true;
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Error updating contact",
      });
      return false;
    } finally {
      setUpdatingContact(false);
    }
  };

  return {
    addingContact,
    addContact,
    addingBulkContacts,
    addBulkContacts,
    updatingContact,
    updateContact,
  };
}
