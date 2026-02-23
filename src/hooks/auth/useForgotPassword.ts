import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

interface ForgotPayload {
  email: string;
}

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  // countdown timer
  const startCountdown = () => {
    setCounter(60);

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendResetLink = async (params: ForgotPayload) => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse>("/auth/forgot-password", params);

      startCountdown();

      showToast({
        type: "success",
        message: "Reset link sent. Check your email.",
      });
      return {
        success: true,
        message: "Reset link sent. Check your email.",
      };
    } catch (error: any) {
      showToast({
        type: "error",
        message: error.message || "Something went wrong",
      });
      return {
        success: false,
        message: error.message || "Something went wrong",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendResetLink,
    loading,
    counter,
  };
};
