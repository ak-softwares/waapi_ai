// src/hooks/useProfile.ts

import { API_BASE_URL } from "@/src/constants/apiConstants/apiConstants";
import { ApiResponse } from "@/src/types/ApiResponse";
import { User } from "@/src/types/User";
import axios from "axios";
import { useState } from "react";

export function useProfile() {
  const [loading, setLoading] = useState(false);

  const getProfile = async (): Promise<ApiResponse> => {
    try {
      setLoading(true);

      const res = await axios.get<ApiResponse>(
        `${API_BASE_URL}/user/profile`
      );

      return res.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message || "Failed to load profile",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    data: User
  ): Promise<ApiResponse> => {
    try {
      setLoading(true);

      const res = await axios.put<ApiResponse>(
        `${API_BASE_URL}/user/profile`,
        data
      );

      return res.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Failed to update profile",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    getProfile,
    updateProfile,
    loading,
  };
}
