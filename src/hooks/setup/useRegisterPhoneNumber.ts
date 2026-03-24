import { useState } from "react";

import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { showToast } from "@/src/utiles/toastHelper/toast";

export function useRegisterPhoneNumber() {
  const [isLoading, setIsLoading] = useState(false);

  const registerPhoneNumber = async (onSuccess?: () => void) => {
    try {
      setIsLoading(true);

      const response = await api.post<ApiResponse>("/facebook/register-phone-number");

      if (response.data.success) {
        showToast({ type: "success", message: response.data.message });
        onSuccess?.();
      } else {
        showToast({ type: "error", message: response.data.message });
      }
    } catch {
      showToast({ type: "error", message: "Something went wrong while registering number" });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    registerPhoneNumber,
  };
}
