import { api } from "@/src/lib/api/apiClient";
import { DeleteMode } from "@/src/utils/enums/deleteMode";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useState } from "react";

interface OnDeletedPayload {
  mode: DeleteMode;
  deletedIds: string[];
}

export function useDeleteContacts(
  onDeleted?: (payload: OnDeletedPayload) => void
) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete single contact
  const deleteContact = async (contactId: string, contactName?: string) => {
    setIsDeleting(true);

    try {
      const res = await api.delete(`/wa-accounts/contacts/${contactId}`);
      const json = res.data;

      if (json.success) {
        showToast({
          type: "success",
          message: `Contact "${contactName ?? ""}" deleted successfully`,
        });

        onDeleted?.({
          mode: DeleteMode.Single,
          deletedIds: [contactId],
        });
      } else {
        showToast({
          type: "error",
          message: json.message || "Failed to delete contact",
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Error deleting contact",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete contacts
  const deleteContactsBulk = async (contactIds: string[]) => {
    if (!contactIds.length) {
      showToast({
        type: "error",
        message: "No contacts selected",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const res = await api.delete("/wa-accounts/contacts/bulk", {
        data: { ids: contactIds },
      });

      const json = res.data;

      if (json.success) {
        showToast({
          type: "success",
          message: "Selected contacts deleted successfully",
        });

        onDeleted?.({
          mode: DeleteMode.Bulk,
          deletedIds: contactIds,
        });
      } else {
        showToast({
          type: "error",
          message: json.message || "Failed to delete contacts",
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Error deleting contacts",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete all contacts
  const deleteAllContacts = async () => {
    setIsDeleting(true);

    try {
      const res = await api.delete("/wa-accounts/contacts", {
        headers: {
          "x-confirm-delete-all": "true",
        },
      });

      const json = res.data;

      if (json.success) {
        const count = json.data?.deletedCount ?? 0;

        showToast({
          type: "success",
          message:
            count > 0
              ? `${count} contacts deleted successfully`
              : "No contacts to delete",
        });

        onDeleted?.({
          mode: DeleteMode.All,
          deletedIds: [],
        });
      } else {
        showToast({
          type: "error",
          message: json.message || "Failed to delete contacts",
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Error deleting contacts",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteContact,
    deleteContactsBulk,
    deleteAllContacts,
    isDeleting,
  };
}