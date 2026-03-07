import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

export function useTemplateMutation(onSaved?: () => void) {
  const [isSaving, setIsSaving] = useState(false);

  const createTemplate = async (payload: any) => {
    try {
      setIsSaving(true);

      const res = await api.post("/wa-accounts/templates", payload);

      showToast({
        type: "success",
        message: res.data.message || "Template created",
      });

      onSaved?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong";

      // console.log("API ERROR:", error?.response?.data);

      showToast({
        type: "error",
        message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTemplate = async (name: string, payload: any) => {
    try {
      setIsSaving(true);

      const res = await api.put(
        `/wa-accounts/templates/${name}`,
        payload
      );

      showToast({
        type: "success",
        message: res.data.message || "Template updated",
      });

      onSaved?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong";

      showToast({
        type: "error",
        message,
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