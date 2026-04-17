import { api } from "@/src/lib/api/apiClient";
import { Template } from "@/src/types/Template";
import { ITEMS_PER_PAGE } from "@/src/utils/constans/apiConstans";
import { useCallback, useEffect, useRef, useState } from "react";

export function useTemplates() {
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [totalTemplates, setTotalTemplates] = useState(0);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [after, setAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const searchQueryRef = useRef("");

  // -----------------------------
  // FETCH
  // -----------------------------
  const fetchTemplates = useCallback(
    async (loadMore: boolean, cursor?: string | null) => {
      if (loadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await api.get("/wa-accounts/templates", {
          params: {
            limit: ITEMS_PER_PAGE,
            ...(loadMore && cursor ? { after: cursor } : {}),
          },
        });

        const json = res.data;

        if (json.success && Array.isArray(json.data)) {
          const nextTemplates = json.data as Template[];

          setAllTemplates((prev) => {
            const nextAllTemplates = loadMore
              ? [...prev, ...nextTemplates]
              : nextTemplates;

            const normalizedSearch = searchQueryRef.current.trim().toLowerCase();
            if (!normalizedSearch) {
              setTemplates(nextAllTemplates);
            } else {
              setTemplates(
                nextAllTemplates.filter((template) =>
                  template.name?.toLowerCase().includes(normalizedSearch)
                )
              );
            }

            return nextAllTemplates;
          });

          const nextCursor = json.pagination?.cursors?.after ?? null;
          const hasMoreByCursor = Boolean(nextCursor);
          const hasMoreByPage =
            (json.pagination?.page || 1) < (json.pagination?.totalPages || 1);

          setAfter(nextCursor);
          setHasMore(hasMoreByCursor || hasMoreByPage);
          setTotalTemplates(json.pagination?.total || 0);
        } else {
          setAfter(null);
          setHasMore(false);
        }
      } catch {
        setAfter(null);
        setHasMore(false);
        setTotalTemplates(0);
      } finally {
        if (loadMore) setLoadingMore(false);
        else setLoading(false);
      }
    },
    []
  );

  // -----------------------------
  // EFFECT
  // -----------------------------
  useEffect(() => {
    fetchTemplates(false);
  }, [fetchTemplates]);

  // -----------------------------
  // LOAD MORE
  // -----------------------------
  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchTemplates(true, after);
    }
  };

  // -----------------------------
  // REFRESH
  // -----------------------------
  const refreshTemplates = () => {
    setAllTemplates([]);
    setTemplates([]);
    setHasMore(true);
    setAfter(null);
    fetchTemplates(false);
  };

  // -----------------------------
  // SEARCH
  // -----------------------------
  const searchTemplates = (text: string) => {
    searchQueryRef.current = text;
    const q = text.trim().toLowerCase();

    if (!q) {
      setTemplates(allTemplates);
      return;
    }

    setTemplates(
      allTemplates.filter((template) =>
        template.name?.toLowerCase().includes(q)
      )
    );
  };

  return {
    templates,
    totalTemplates,

    loading,
    loadingMore,
    hasMore,

    loadMore,
    refreshTemplates,
    searchTemplates,

    setTemplates, // optional (like chats)
  };
}