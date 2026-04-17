import { useState } from "react";

import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { showToast } from "@/src/utils/toastHelper/toast";

export function useSubscribeApp() {
  const [isLoading, setIsLoading] = useState(false);

  const subscribeAppToWABA = async (onSuccess?: () => void) => {
    try {
      setIsLoading(true);
      const response = await api.post<ApiResponse>("/facebook/subscribe-app");

      if (!response.data.success) {
        showToast({
          type: "error",
          message: response.data.message || "Failed to subscribe app",
        });
        return false;
      }

      showToast({ type: "success", message: response.data.message || "App subscribed" });
      onSuccess?.();
      return true;
    } catch (error: any) {
      showToast({ type: "error", message: error?.message || "Failed to subscribe app" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, subscribeAppToWABA };
}
