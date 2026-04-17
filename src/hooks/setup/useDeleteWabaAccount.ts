import { useState } from "react";

import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { showToast } from "@/src/utils/toastHelper/toast";

export function useDeleteWabaAccount(onSuccess?: () => void) {
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await api.delete<ApiResponse>("/facebook/accounts");

      if (!response.data.success) {
        showToast({
          type: "error",
          message: response.data.message || "Failed to delete WABA account",
        });
        return false;
      }

      showToast({ type: "success", message: "WABA account deleted successfully" });
      onSuccess?.();
      return true;
    } catch (error: any) {
      showToast({
        type: "error",
        message: `Failed to delete WABA account: ${error?.message || "Unknown error"}`,
      });
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleting, deleteAccount };
}
