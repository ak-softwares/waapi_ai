import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { WaSetupStatus } from "@/src/types/WabaAccount";
import { API_BASE_DOMAIN } from "@/src/utils/constans/apiConstans";
import { showToast } from "@/src/utils/toastHelper/toast";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useMemo, useState } from "react";

type WabaAccount = any; // replace with actual type

interface UseWhatsAppSignupReturn {
  launchWhatsAppSignup: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  waSetupStatus: WaSetupStatus | null;
  isFacebookConnected: boolean;
  isLaunchingSignup: boolean;
  isCheckingStatus: boolean;
  wabaAccount: WabaAccount | null;
  isLoadingWaba: boolean;
}

export function useWhatsAppSignup(): UseWhatsAppSignupReturn {
  const [isLaunchingSignup, setIsLaunchingSignup] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const [waSetupStatus, setWaSetupStatus] = useState<WaSetupStatus | null>(null);

  const [wabaAccount, setWabaAccount] = useState<WabaAccount | null>(null);
  const [isLoadingWaba, setIsLoadingWaba] = useState(false);

  // ✅ Derived state (single source of truth)
  const isFacebookConnected = useMemo(() => {
    return !!waSetupStatus?.isTokenAvailable;
  }, [waSetupStatus]);

  // ✅ Fetch WABA (only when connected)
  const fetchWaba = useCallback(async () => {
    try {
      setIsLoadingWaba(true);

      const response = await api.get<ApiResponse<WabaAccount>>("/facebook/waba");

      if (response.data.success && response.data.data) {
        setWabaAccount(response.data.data);
      }
    } catch {
      // optional: log error in dev
    } finally {
      setIsLoadingWaba(false);
    }
  }, []);

  // ✅ Refresh full setup status
  const refreshStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const response = await api.get<ApiResponse<WaSetupStatus>>(
        "/wa-accounts/check-status"
      );

      if (response.data.success && response.data.data) {
        setWaSetupStatus(response.data.data);
      } else {
        setWaSetupStatus(null);
      }
    } catch {
      setWaSetupStatus(null);
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  // ✅ Initial load
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // ✅ Fetch WABA only when connected
  useEffect(() => {
    if (isFacebookConnected) {
      fetchWaba();
    } else {
      setWabaAccount(null);
    }
  }, [isFacebookConnected, fetchWaba]);

  // ✅ Launch signup
  const launchWhatsAppSignup = useCallback(async () => {
    setIsLaunchingSignup(true);

    try {
      const response = await api.post<
        ApiResponse<{ token: string }>
      >("/auth/temp-token");

      if (!response.data?.success) {
        throw new Error("Failed to generate setup token");
      }

      const { token } = response.data.data!;

      const fullUrl = `${API_BASE_DOMAIN}/dashboard/setup/?token=${token}`;

      await Linking.openURL(fullUrl);

      showToast({
        type: "info",
        message: "Complete setup in browser, then tap Refresh Status.",
      });
    } catch {
      showToast({
        type: "error",
        message: "Could not start WhatsApp signup.",
      });
    } finally {
      setIsLaunchingSignup(false);
    }
  }, []);

  return {
    launchWhatsAppSignup,
    refreshStatus,
    waSetupStatus,
    isFacebookConnected,
    isLaunchingSignup,
    isCheckingStatus,
    wabaAccount,
    isLoadingWaba,
  };
}