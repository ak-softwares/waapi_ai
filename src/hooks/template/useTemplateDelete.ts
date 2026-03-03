import { ApiResponse } from "@/src/types/ApiResponse";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

export function useTemplateDelete(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // SINGLE DELETE
  // -----------------------------
  const deleteTemplate = async (name: string) => {
    if (!name) return false;

    setLoading(true);

    try {
      const res = await fetch(`/api/wa-accounts/templates/${name}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();

      if (!json.success) {
        showToast({ type: "error", message: json.message || "Failed to delete template." });
        return false;
      }

      showToast({ type: "success", message: "Template deleted successfully." });
      onSuccess?.();
      return true;
    } catch (error) {
      showToast({ type: "error", message: "Delete failed." });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // BULK DELETE
  // -----------------------------
  const bulkDeleteTemplates = async (names: string[]) => {
    if (!names.length) return false;

    setLoading(true);

    try {
      const res = await fetch(`/api/wa-accounts/templates/bulk-delete`, {
        method: "DELETE",
        body: JSON.stringify({ names }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json: ApiResponse = await res.json();

      if (!json.success) {
        showToast({ type: "error", message: json.message || "Bulk delete failed." });
        return false;
      }

      showToast({ type: "success", message: "Selected templates deleted." });
      onSuccess?.();
      return true;
    } catch (error) {
      showToast({ type: "error", message: "Bulk delete failed." });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteTemplate,
    bulkDeleteTemplates,
    loading,
  };
}