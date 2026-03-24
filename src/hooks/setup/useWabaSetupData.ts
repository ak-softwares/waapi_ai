import { useEffect, useState } from "react";

import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { WabaAccount, WaSetupStatus } from "@/src/types/WabaAccount";
import { showToast } from "@/src/utiles/toastHelper/toast";

export function useWabaSetupData() {
  const [loadingWaba, setLoadingWaba] = useState(true);
  const [loadingSetupData, setLoadingSetupData] = useState(true);
  const [waSetupStatus, setWaSetupStatus] = useState<WaSetupStatus | null>(null);
  const [wabaAccount, setWabaAccount] = useState<WabaAccount | null>(null);

  const fetchStatus = async () => {
    try {
      setLoadingWaba(true);
      const response = await api.get<ApiResponse<WaSetupStatus>>("/wa-accounts/check-status");
      if (response.data.success && response.data.data) {
        setWaSetupStatus(response.data.data);
      }
    } catch (error: any) {
      showToast({
        type: "error",
        message: `Error loading setup status: ${error?.message || "Unknown error"}`,
      });
    } finally {
      setLoadingWaba(false);
    }
  };

  const fetchWaba = async () => {
    try {
      setLoadingSetupData(true);
      const response = await api.get<ApiResponse<WabaAccount>>("/facebook/waba");
      if (response.data.success && response.data.data) {
        setWabaAccount(response.data.data);
      }
    } catch {
      // ignore silently
    } finally {
      setLoadingSetupData(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchStatus(), fetchWaba()]);
  }, []);

  return {
    loadingWaba,
    loadingSetupData,
    waSetupStatus,
    wabaAccount,
    fetchStatus,
    fetchWaba,
  };
}
