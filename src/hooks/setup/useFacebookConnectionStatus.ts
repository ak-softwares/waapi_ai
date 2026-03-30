import { useMemo } from "react";

import { useFacebookConnectionContext } from "@/src/context/FacebookConnectionContext";
import { WabaAccount } from "@/src/types/WabaAccount";

export function useFacebookConnectionStatus(wabaAccount?: WabaAccount | null) {
  const {
    waSetupStatus,
    isFacebookConnected,
    isLoadingFacebookStatus,
    refreshFacebookStatus,
  } = useFacebookConnectionContext();

  const isAllStepsDone = useMemo(
    () =>
      !!(
        waSetupStatus?.isTokenAvailable &&
        waSetupStatus?.isAppSubscription &&
        waSetupStatus?.isPhoneRegistered &&
        wabaAccount?.account_review_status === "APPROVED"
      ),
    [waSetupStatus, wabaAccount]
  );

  return {
    waSetupStatus,
    isFacebookConnected,
    isLoadingFacebookStatus,
    refreshFacebookStatus,
    isAllStepsDone,
  };
}
