import { api } from "@/src/lib/api/apiClient";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useState } from "react";

export const useFavourite = () => {
  const [loading, setLoading] = useState(false);

  const toggleFavourite = async (chatId: string) => {
    setLoading(true);

    try {
      const res = await api.patch(`/wa-accounts/chats/${chatId}/favourite`);
      const json = res.data;

      if (json.success) {
        showToast({
          type: "success",
          message: json.message,
        });

        return json.data.isFavourite; // return new state
      }

      showToast({
        type: "error",
        message: json.message || "Failed to update favourite",
      });

      return null;
    } catch {
      showToast({
        type: "error",
        message: "Something went wrong",
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleFavourite, loading };
};