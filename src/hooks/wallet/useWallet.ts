import { api } from "@/src/lib/api/apiClient";
import { WalletAnalytics } from "@/src/types/Wallet";
import { useCallback, useEffect, useState } from "react";

interface UseWalletResult {
  data: WalletAnalytics | null;
  loading: boolean;
  error: string | null;
  setData: React.Dispatch<React.SetStateAction<WalletAnalytics | null>>;
  refetch: () => Promise<void>;
}

export function useWallet(): UseWalletResult {
  const [data, setData] = useState<WalletAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/wallet");
      const json = res.data;

      if (!json?.success) {
        throw new Error(json?.error || "Failed to fetch wallet");
      }

      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch wallet");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return {
    data,
    loading,
    error,
    setData,
    refetch: fetchWallet,
  };
}
