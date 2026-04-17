import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useState } from "react";

type SignupParams = {
  name: string;
  phone: string;
  email?: string;
  password?: string;
};

export function useSignup() {
  const [loading, setLoading] = useState(false);

  const signup = async (params: SignupParams): Promise<ApiResponse> => {
    if (!params.name || !params.phone || !params.email || !params.password) {
      showToast({
        type: "error",
        message: "Name, email, phone and password are required",
      });

      return { success: false, message: "Name, email, phone and password are required" };
    }

    try {
      setLoading(true);
      const response = await api.post<ApiResponse>("/auth/signup", params);
      // showToast({
      //   type: "success",
      //   message: response.data.message || "Signup successful",
      // });
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Signup failed";
      showToast({
        type: "error",
        message: message,
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
    signup,
    loading,
  };
}