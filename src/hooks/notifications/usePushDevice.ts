import { api } from "@/src/lib/api/apiClient";
import { useState } from "react";

interface RegisterDevicePayload {
  deviceId: string;
  token: string;
}

export function usePushDevice() {
  const [loading, setLoading] = useState(false);

  const registerDevice = async ({ deviceId, token }: RegisterDevicePayload) => {
    if (!deviceId || !token) return false;

    setLoading(true);

    try {
      const res = await api.post("/users/me/push-tokens", {
        deviceId,
        token,
      });

      const json = res.data;

      if (json.success) {
        return true;
      }

      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unregisterDevice = async (deviceId: string) => {
    if (!deviceId) return false;

    setLoading(true);

    try {
      const res = await api.delete("/users/me/push-tokens", {
        data: { deviceId },
      });

      const json = res.data;

      if (json.success) {
        return true;
      }

      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerDevice,
    unregisterDevice,
    loading,
  };
}