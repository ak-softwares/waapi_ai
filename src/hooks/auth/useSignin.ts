import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

type SigninParams = {
  email: string;
  password: string;
}

export function useSignin() {
  const [loading, setLoading] = useState(false);

  const signin = async (params: SigninParams): Promise<ApiResponse> => {
    if (!params.email || !params.password) {
      showToast({
        type: "error",
        message: "All fields are required",
      });

      return { success: false, message: "All fields are required" };
    }

    try {
      setLoading(true);
      const response = await api.post<ApiResponse>("/auth/signin", params);
      showToast({
        type: "success",
        message: response.data.message || "Login successful",
      });
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Something went wrong";
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
    signin,
    loading,
  };
}
