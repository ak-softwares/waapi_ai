import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";
import Toast from "react-native-toast-message";

type OtpVerifyParams = {
  phone: string;
  otp: string;
}

export function useOtpLogin() {
  const [loading, setLoading] = useState(false);

  const sendOtp = async (phone: string) => {
    if (!phone) {
      showToast({
        type: "error",
        message: "Phone is required",
      });
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await api.post<ApiResponse>("/auth/send-otp", { phone });

      // showToast({
      //   type: "success",
      //   message: "OTP sent successfully",
      // });
      return response.data;

    } catch (error: any) {
      const message = error?.response?.data?.message || "Something went wrong";
      showToast({
        type: "error",
        message: message,
      });

      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (params : OtpVerifyParams): Promise<ApiResponse> => {
    if (!params.phone || !params.otp) {
      Toast.show({
        type: "error",
        text1: "Phone and OTP are required",
      });

      return { success: false, message: "Phone and OTP are required" };
    }

    try {
      setLoading(true);
      const response = await api.post<ApiResponse>("/auth/verify-otp", params);
      // Toast.show({
      //   type: "success",
      //   text1: response.data.message || "Login successful",
      // });
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Invalid OTP";
      Toast.show({
        type: "error",
        text1: message,
      });

      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendOtp,
    verifyOtp,
    loading,
  };
}
