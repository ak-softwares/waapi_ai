import { api } from "@/src/lib/api/apiClient";
import { AIAssistant } from "@/src/types/Ai";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useCallback, useEffect, useState } from "react";

export function useAiAssistant() {
  const [aiAssistant, setAiAssistant] = useState<AIAssistant>({
    prompt: "",
    isActive: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * =========================
   * FETCH AI CONFIG
   * =========================
   */
  const fetchAiAssistant = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/ai/ai-assistant");

      const json = res.data;

      if (json?.success) {
        const data = json.data ?? { prompt: "", isActive: false };
        setAiAssistant(data);
        return data;
      } else {
        throw new Error("Invalid response");
      }
    } catch (error: any) {
      showToast({ type: "error", message: error?.message || "Failed to load AI config" });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * =========================
   * UPDATE AI CONFIG
   * =========================
   */
  const updateAiAssistant = useCallback(
    async (payload: Partial<AIAssistant>) => {
      try {
        setSaving(true);

        const res = await api.patch("/ai/ai-assistant", payload);

        const json = res.data;

        if (json?.success) {
          const updated = json.data ?? payload;

          setAiAssistant(prev => ({
            ...prev,
            ...updated,
          }));

          showToast({ type: "success", message: "AI Assistant updated successfully" });

          return updated;
        } else {
          throw new Error("Update failed");
        }
      } catch (error: any) {
        showToast({ type: "error", message: error?.message || "Update failed" });
        throw error;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  /**
   * =========================
   * LOAD ON MOUNT
   * =========================
   */
  useEffect(() => {
    fetchAiAssistant();
  }, [fetchAiAssistant]);

  return {
    aiAssistant,
    setAiAssistant,

    loading,
    saving,

    fetchAiAssistant,
    updateAiAssistant,
  };
}