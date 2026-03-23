import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { API_BASE_DOMAIN } from "@/src/utiles/constans/apiConstans";
import { showToast } from "@/src/utiles/toastHelper/toast";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useState } from "react";

type CheckStatusData = {
  isTokenAvailable?: boolean;
};

interface UseWhatsAppSignupReturn {
  launchWhatsAppSignup: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  facebookConnected: boolean;
  isSaving: boolean;
  isLoading: boolean;
}

const WHATSAPP_SIGNUP_URL = "https://wa-api.me/dashboard/setup";

export function useWhatsAppSignup(): UseWhatsAppSignupReturn {
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<CheckStatusData>>("/wa-accounts/check-status");
      const isConnected = !!response.data?.success && !!response.data?.data?.isTokenAvailable;
      setFacebookConnected(isConnected);
    } catch {
      setFacebookConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const launchWhatsAppSignup = useCallback(async () => {
    setIsSaving(true);

    try {
      // 1. Call your backend route
      const response = await api.post<
        ApiResponse<{
          token: string;
          expiresAt: string;
          ttlMinutes: number;
          headerName: string;
          setupUrl: string;
        }>
      >("/auth/temp-token");

      if (!response.data?.success) {
        throw new Error("Failed to generate setup token");
      }

      const { token } = response.data.data!;

      // 2. Build full URL with token
      const fullUrl = `${API_BASE_DOMAIN}/dashboard/setup/?token=${token}`;

      // 3. Open in browser
      await Linking.openURL(fullUrl);

      showToast({
        type: "info",
        message: "Complete setup in browser, then tap Refresh Status.",
      });
    } catch (error) {
      console.log("Signup error:", error);

      showToast({
        type: "error",
        message: "Could not start WhatsApp signup.",
      });
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    launchWhatsAppSignup,
    refreshStatus,
    facebookConnected,
    isSaving,
    isLoading,
  };
}
