"use client";

import { api } from "@/src/lib/api/apiClient";
import { User } from "@/src/types/User";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useCallback, useEffect, useState } from "react";

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/users/me");
      if (!res.data?.success) {
        showToast({
          type: "error",
          message: res.data?.message || "Failed to load profile",
        });
        return;
      }

      setProfile(res.data.data);
    } catch (err: any) {
      showToast({
        type: "error",
        message: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    refreshProfile: fetchProfile,
  };
}