import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { Message, MessageStatus } from "@/src/types/Messages";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useCallback, useEffect, useMemo, useState } from "react";

export type BroadcastReportSummary = {
  totalMessages: number;
  apiSentMessages: number;
  fbAcceptedMessages: number;
  deliveredMessages: number;
  readMessages: number;
};

type BroadcastReportResponse = {
  rows?: Message[];
  summary?: Partial<BroadcastReportSummary>;
};

type UseBroadcastMessageReportProps = {
  chatId: string;
  messageId?: string;
};

export function useBroadcastMessageReport({
  chatId,
  messageId,
}: UseBroadcastMessageReportProps) {
  const [rows, setRows] = useState<Message[]>([]);
  const [summary, setSummary] = useState<BroadcastReportSummary>({
    totalMessages: 0,
    apiSentMessages: 0,
    fbAcceptedMessages: 0,
    deliveredMessages: 0,
    readMessages: 0,
  });
  const [perPage] = useState(20);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MessageStatus>("all");
  const [fbFilter, setFbFilter] = useState<"all" | "accepted" | "pending">("all");

  const fetchReport = useCallback(
    async (pageToFetch: number) => {
      if (!chatId) {
        setRows([]);
        setHasMore(false);
        return;
      }

      if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("chatId", chatId);
        params.set("page", String(pageToFetch));
        params.set("per_page", String(perPage));

        if (messageId) params.set("messageId", messageId);
        if (search.trim()) params.set("q", search.trim());
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (fbFilter !== "all") params.set("fb", fbFilter);

        const res = await api.get<ApiResponse<BroadcastReportResponse>>(
          `/wa-accounts/chats/broadcast/report?${params.toString()}`
        );

        const json = res.data;

        if (!json.success) {
          throw new Error(json.message || "Failed to fetch report");
        }

        const reportRows: Message[] = json.data?.rows || [];
        const reportSummary = json.data?.summary || {};

        setSummary((prev) => ({
          ...prev,
          ...reportSummary,
        }));

        setRows((prev) =>
          pageToFetch === 1 ? [...reportRows] : [...prev, ...reportRows]
        );

        const totalPages = json.pagination?.totalPages || 1;
        setHasMore(pageToFetch < totalPages);
      } catch (err: any) {
        showToast({ type: "error", message: err.message || "Failed to load broadcast report" });
      } finally {
        if (pageToFetch === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [chatId, messageId, perPage, search, statusFilter, fbFilter]
  );

  useEffect(() => {
    fetchReport(page);
  }, [fetchReport, page, refreshFlag]);

  useEffect(() => {
    setRows([]);
    setPage(1);
    setHasMore(true);
    fetchReport(1);
  }, [chatId, messageId, fetchReport]);

  const refreshReport = () => {
    setRows([]);
    setPage(1);
    setHasMore(true);
    setRefreshFlag((value) => value + 1);
  };

  const filteredRows = useMemo(() => {
    let list = [...rows];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter((item) => item.to?.toLowerCase().includes(query));
    }

    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }

    if (fbFilter !== "all") {
      if (fbFilter === "accepted") {
        list = list.filter((item) => Boolean(item.sentAt));
      }
      if (fbFilter === "pending") {
        list = list.filter((item) => !item.sentAt);
      }
    }

    return list;
  }, [rows, search, statusFilter, fbFilter]);

  const searchMessages = (value: string) => {
    setSearch(value);
    setRows([]);
    setPage(1);
    setHasMore(true);
  };

  return {
    rows: filteredRows,
    rawRows: rows,
    summary,
    page,
    setPage,
    hasMore,
    loading,
    loadingMore,
    searchMessages,
    statusFilter,
    setStatusFilter,
    fbFilter,
    setFbFilter,
    refreshReport,
    setRows,
  };
}
