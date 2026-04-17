import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useState } from "react";

export function useTemplateDelete(onDeleted?: () => void) {
  const [isDeleting, setIsDeleting] = useState(false);

  // -----------------------------
  // SINGLE DELETE
  // -----------------------------
  const deleteTemplate = async (name: string) => {
    if (!name) return;

    try {
      setIsDeleting(true);

      const { data } = await api.delete(`/wa-accounts/templates/${name}`);

      if (!data?.success) {
        throw new Error(data?.message || "Delete failed");
      }

      showToast({
        type: "success",
        message: data.message || "Template deleted",
      });

      onDeleted?.();
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Something went wrong",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // -----------------------------
  // BULK DELETE
  // -----------------------------
  const bulkDeleteTemplates = async (names: string[]) => {
    if (!names.length) return;

    try {
      setIsDeleting(true);

      const { data } = await api.delete("/wa-accounts/templates/bulk-delete", {
        data: { names },
      });

      if (!data?.success) {
        throw new Error(data?.message || "Bulk delete failed");
      }

      showToast({
        type: "success",
        message: data.message || "Templates deleted",
      });

      onDeleted?.();
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Something went wrong",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    deleteTemplate,
    bulkDeleteTemplates,
  };
}