import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useCallback, useEffect, useState } from "react";

export type ApiToken = {
  _id: string;
  name?: string;
  updatedAt?: string;
  createdAt?: string;
  token?: string; // raw token (only returned on create)
};

export function useApiToken(autoLoad: boolean = true) {
  const [loading, setLoading] = useState(false);
  const [apiToken, setApiToken] = useState<ApiToken | null>(null);

  // ================= GET =================
  const loadApiToken = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/api-token");
      const json = res.data;

      setApiToken(json?.data?.token ?? null);
    } catch (error) {
      console.log("Failed to load token", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ================= CREATE =================
  const generateNewToken = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.post("/api-token");
      const json = res.data;

      const token = json?.data?.token ?? null;

      setApiToken(token);

      showToast({
        type: "success",
        message: "New API token generated",
      });

      return token?.token ?? ""; // raw token
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to generate token",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ================= DELETE =================
  const revokeToken = useCallback(async (tokenId: string) => {
    try {
      setLoading(true);

      await api.delete(`/api-token/${tokenId}`);

      setApiToken(null);

      showToast({
        type: "success",
        message: "API token revoked",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to revoke token",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) loadApiToken();
  }, [autoLoad, loadApiToken]);

  const refetch = async () => {
    await loadApiToken();
  };

  return {
    loading,
    apiToken,
    loadApiToken,
    generateNewToken,
    refetch,
    revokeToken,
  };
}