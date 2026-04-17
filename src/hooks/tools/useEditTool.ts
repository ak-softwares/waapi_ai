import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { Tool, ToolPayload } from "@/src/types/Tool";
import { showToast } from "@/src/utils/toastHelper/toast";
import { useState } from "react";

export function useEditTool(
  onSuccess?: (tool: Tool) => void,
  onDeleteSuccess?: (toolId: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // ✅ CREATE
  const createTool = async (payload: ToolPayload) => {
    try {
      setLoading(true);

      const res = await api.post<ApiResponse<Tool>>("/ai/tools", payload);
      const json = res.data;

      if (!json.success) {
        showToast({
          type: "error",
          message: json.message || "Failed to create tool",
        });
        return;
      }

      if (!json.data) {
        showToast({
          type: "error",
          message: "Tool created but no data returned",
        });
        return;
      }

      showToast({
        type: "success",
        message: "Tool connected successfully",
      });

      onSuccess?.(json.data);
      return json.data;
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE
  const updateTool = async (toolDbId: string, payload: ToolPayload) => {
    try {
      setLoading(true);

      const res = await api.patch<ApiResponse<Tool>>(
        `/ai/tools/${toolDbId}`,
        payload
      );

      const json = res.data;

      if (!json.success) {
        showToast({
          type: "error",
          message: json.message || "Failed to update tool",
        });
        return;
      }

      if (!json.data) {
        showToast({
          type: "error",
          message: "Tool updated but no data returned",
        });
        return;
      }

      showToast({
        type: "success",
        message: "Tool updated successfully",
      });

      onSuccess?.(json.data);
      return json.data;
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const deleteTool = async (toolDbId: string) => {
    try {
      setIsDeleteLoading(true);

      const res = await api.delete<ApiResponse<{ _id: string }>>(
        `/ai/tools/${toolDbId}`
      );

      const json = res.data;

      if (!json.success) {
        showToast({
          type: "error",
          message: json.message || "Failed to delete tool",
        });
        return;
      }

      showToast({
        type: "success",
        message: "Tool deleted successfully",
      });

      onDeleteSuccess?.(toolDbId);

      return json.data;
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.message || "Something went wrong",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return {
    createTool,
    updateTool,
    deleteTool,
    loading,
    isDeleteLoading,
  };
}