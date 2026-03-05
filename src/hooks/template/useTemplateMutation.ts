import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

export function useTemplateMutation(onSaved?: () => void) {
  const [isSaving, setIsSaving] = useState(false);

  const createTemplate = async (payload: any) => {
    try {
      setIsSaving(true);

      const { data } = await api.post("/wa-accounts/templates", payload);

      if (!data?.success) {
        throw new Error(data?.message || "Create failed");
      }

      showToast({
        type: "success",
        message: data.message || "Template created",
      });

      onSaved?.();
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Something went wrong",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTemplate = async (id: string, payload: any) => {
    try {
      setIsSaving(true);

      const { data } = await api.put(
        `/wa-accounts/templates/${id}`,
        payload
      );

      if (!data?.success) {
        throw new Error(data?.message || "Update failed");
      }

      showToast({
        type: "success",
        message: data.message || "Template updated",
      });

      onSaved?.();
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Something went wrong",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    createTemplate,
    updateTemplate,
  };
}