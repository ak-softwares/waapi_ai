"use client";

import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useState } from "react";

export function useProfileMutation(
  onSuccess?: () => void,
  onDeleteSuccess?: () => void
) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { logout } = useAuth();

  // ========================
  // UPDATE PROFILE
  // ========================
  const updateProfile = async (payload: any) => {
    try {
      setLoading(true);
      // console.log("Updating profile with payload:", payload);
      const res = await api.put("/user/profile", payload);

      showToast({
        type: "success",
        message: res.data.message || "Profile updated",
      });

      onSuccess?.();

      return true;
    } catch (err: any) {
      showToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // DELETE PROFILE
  // ========================
  const deleteProfile = async () => {
    try {
      setDeleteLoading(true);

      const res = await api.delete("/user/profile");

      if (!res.data?.success) {
        showToast({
          type: "error",
          message: res.data?.message || "Failed to delete account",
        });
        return false;
      }

      showToast({
        type: "success",
        message: res.data.message || "Account deleted",
      });

      logout();
      onDeleteSuccess?.();

      return true;
    } catch (err: any) {
      showToast({
        type: "error",
        message: err.message || "Unexpected error",
      });
      return false;
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    updateProfile,
    deleteProfile,
    loading,
    deleteLoading,
  };
}