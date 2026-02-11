import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";

export interface Entry {
  id: string;
  filename: string;
  created_at: number;
  duration_seconds: number | null;
  transcript: string | null;
  title: string | null;
}

const PAGE_SIZE = 100;

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const requestIdRef = useRef(0);

  const runQuery = useCallback(
    async ({ offset, append }: { offset: number; append: boolean }) => {
      const requestId = ++requestIdRef.current;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await invoke<Entry[]>("query_entries", {
          query: debouncedQuery || null,
          limit: PAGE_SIZE,
          offset,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setEntries((previous) => (append ? [...previous, ...result] : result));
        setHasMore(result.length === PAGE_SIZE);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedQuery],
  );

  const loadEntries = useCallback(async () => {
    await runQuery({ offset: 0, append: false });
  }, [runQuery]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    await runQuery({ offset: entries.length, append: true });
  }, [entries.length, hasMore, loading, loadingMore, runQuery]);

  const deleteEntry = async (id: string) => {
    await invoke("delete_entry", { id });
    await loadEntries();
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    loading,
    loadingMore,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadEntries,
    loadMore,
    deleteEntry,
  };
}
