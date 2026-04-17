import { useState } from "react";

import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utils/toastHelper/toast";

type CodeMethod = "SMS" | "VOICE";

export function usePhoneCodeVerification() {
  const [requestCodeLoading, setRequestCodeLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);

  const requestCode = async (code_method: CodeMethod = "SMS") => {
    try {
      setRequestCodeLoading(true);

      const response = await api.post("/facebook/request-code", { code_method });

      if (!response.data?.success) {
        showToast({
          type: "error",
          message: response.data?.message || "Failed to request verification code",
        });
        return false;
      }

      showToast({ type: "success", message: "Verification code sent successfully" });
      return true;
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Failed to request verification code",
      });
      return false;
    } finally {
      setRequestCodeLoading(false);
    }
  };

  const verifyCode = async (code: string) => {
    try {
      setVerifyCodeLoading(true);

      if (!code) {
        showToast({ type: "error", message: "Verification code is required" });
        return false;
      }

      const response = await api.post("/facebook/verify-code", { code });

      if (!response.data?.success) {
        showToast({ type: "error", message: response.data?.message || "Verification failed" });
        return false;
      }

      showToast({ type: "success", message: "Phone number verified successfully" });
      return true;
    } catch (error: any) {
      showToast({ type: "error", message: error?.message || "Verification failed" });
      return false;
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  return {
    requestCode,
    verifyCode,
    requestCodeLoading,
    verifyCodeLoading,
  };
}
