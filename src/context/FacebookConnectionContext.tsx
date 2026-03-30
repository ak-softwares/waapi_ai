import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { WaSetupStatus } from "@/src/types/WabaAccount";

type FacebookConnectionContextType = {
  waSetupStatus: WaSetupStatus | null;
  isFacebookConnected: boolean;
  isLoadingFacebookStatus: boolean;
  refreshFacebookStatus: () => Promise<void>;
};

const FacebookConnectionContext = createContext<FacebookConnectionContextType>({
  waSetupStatus: null,
  isFacebookConnected: false,
  isLoadingFacebookStatus: true,
  refreshFacebookStatus: async () => {},
});

export function FacebookConnectionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const [waSetupStatus, setWaSetupStatus] = useState<WaSetupStatus | null>(null);
  const [isLoadingFacebookStatus, setIsLoadingFacebookStatus] = useState(false);
  const hasFetchedRef = useRef(false);

  const refreshFacebookStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setWaSetupStatus(null);
      return;
    }

    setIsLoadingFacebookStatus(true);
    try {
      const response = await api.get<ApiResponse<WaSetupStatus>>("/wa-accounts/check-status");

      if (response.data.success && response.data.data) {
        setWaSetupStatus(response.data.data);
      } else {
        setWaSetupStatus(null);
      }
    } catch {
      setWaSetupStatus(null);
    } finally {
      setIsLoadingFacebookStatus(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      hasFetchedRef.current = false;
      setWaSetupStatus(null);
      return;
    }

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refreshFacebookStatus();
    }
  }, [isAuthenticated, isReady, refreshFacebookStatus]);

  const value = useMemo(
    () => ({
      waSetupStatus,
      isFacebookConnected: !!waSetupStatus?.isTokenAvailable,
      isLoadingFacebookStatus,
      refreshFacebookStatus,
    }),
    [waSetupStatus, isLoadingFacebookStatus, refreshFacebookStatus]
  );

  return (
    <FacebookConnectionContext.Provider value={value}>
      {children}
    </FacebookConnectionContext.Provider>
  );
}

export function useFacebookConnectionContext() {
  return useContext(FacebookConnectionContext);
}
