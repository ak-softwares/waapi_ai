import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

export function useGoogleSignin() {
  const [loading, setLoading] = useState(false);

  const signinWithGoogle = async (accessToken: string): Promise<ApiResponse> => {
    if (!accessToken) {
      showToast({
        type: "error",
        message: "Google access token is missing",
      });

      return { success: false, message: "Google access token is missing" };
    }

    try {
      setLoading(true);
      const response = await api.post<ApiResponse>("/auth/google", {
        accessToken,
      });

      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Google login failed";
      showToast({
        type: "error",
        message,
      });

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signinWithGoogle,
    loading,
  };
}
