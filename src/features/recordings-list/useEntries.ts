import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";

export interface Tag {
  id: string;
  name: string;
  created_at: number;
}

export interface Entry {
  id: string;
  filename: string;
  created_at: number;
  duration_seconds: number | null;
  transcript: string | null;
  title: string | null;
  tags: Tag[];
}

interface EntryRow {
  id: string;
  filename: string;
  created_at: number;
  duration_seconds: number | null;
  transcript: string | null;
  title: string | null;
}

interface EntryTagRecord {
  entry_id: string;
  tag_id: string;
  tag_name: string;
  tag_created_at: number;
}

const PAGE_SIZE = 100;

function sortTagsByName(tags: Tag[]): Tag[] {
  return [...tags].sort((a, b) => a.name.localeCompare(b.name));
}

function mapEntryTags(records: EntryTagRecord[]): Map<string, Tag[]> {
  const tagsByEntry = new Map<string, Tag[]>();

  for (const record of records) {
    const tag: Tag = {
      id: record.tag_id,
      name: record.tag_name,
      created_at: record.tag_created_at,
    };

    const existing = tagsByEntry.get(record.entry_id) ?? [];
    existing.push(tag);
    tagsByEntry.set(record.entry_id, existing);
  }

  for (const [entryId, entryTags] of tagsByEntry.entries()) {
    tagsByEntry.set(entryId, sortTagsByName(entryTags));
  }

  return tagsByEntry;
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterTagIds, setSelectedFilterTagIds] = useState<string[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const requestIdRef = useRef(0);

  const loadTags = useCallback(async () => {
    try {
      const result = await invoke<Tag[]>("list_tags");
      setTags(sortTagsByName(result));
    } catch (error) {
      console.error("Failed to load tags:", error);
      setTags([]);
    }
  }, []);

  const runQuery = useCallback(
    async ({ offset, append }: { offset: number; append: boolean }) => {
      const requestId = ++requestIdRef.current;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await invoke<EntryRow[]>("query_entries", {
          query: debouncedQuery || null,
          limit: PAGE_SIZE,
          offset,
        });
        const entryIds = result.map((entry) => entry.id);
        let tagsByEntry = new Map<string, Tag[]>();
        if (entryIds.length > 0) {
          try {
            const tagRecords = await invoke<EntryTagRecord[]>("get_entry_tags", {
              entryIds,
            });
            tagsByEntry = mapEntryTags(tagRecords);
          } catch (error) {
            console.error("Failed to load entry tags:", error);
          }
        }
        const hydratedEntries: Entry[] = result.map((entry) => ({
          ...entry,
          tags: tagsByEntry.get(entry.id) ?? [],
        }));

        if (requestId !== requestIdRef.current) {
          return;
        }

        setEntries((previous) => (append ? [...previous, ...hydratedEntries] : hydratedEntries));
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

  const createTag = useCallback(async (name: string) => {
    const createdTag = await invoke<Tag>("create_tag", { name });
    setTags((previous) => {
      const withoutExisting = previous.filter((tag) => tag.id !== createdTag.id);
      return sortTagsByName([...withoutExisting, createdTag]);
    });
    return createdTag;
  }, []);

  const deleteTag = useCallback(async (tagId: string) => {
    await invoke("delete_tag", { tagId });
    setTags((previous) => previous.filter((tag) => tag.id !== tagId));
    setEntries((previous) =>
      previous.map((entry) => ({
        ...entry,
        tags: entry.tags.filter((tag) => tag.id !== tagId),
      })),
    );
  }, []);

  const setEntryTags = useCallback(
    async (entryId: string, tagIds: string[]) => {
      const uniqueTagIds = [...new Set(tagIds)];
      const tagsById = new Map(tags.map((tag) => [tag.id, tag]));
      const nextTags = uniqueTagIds
        .map((tagId) => tagsById.get(tagId))
        .filter((tag): tag is Tag => Boolean(tag));

      setEntries((previous) =>
        previous.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                tags: sortTagsByName(nextTags),
              }
            : entry,
        ),
      );

      try {
        await invoke("set_entry_tags", {
          entryId,
          tagIds: uniqueTagIds,
        });
      } catch (error) {
        await loadEntries();
        throw error;
      }
    },
    [loadEntries, tags],
  );

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

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    entries,
    tags,
    loading,
    loadingMore,
    hasMore,
    searchQuery,
    setSearchQuery,
    selectedFilterTagIds,
    setSelectedFilterTagIds,
    loadEntries,
    loadMore,
    deleteEntry,
    createTag,
    deleteTag,
    setEntryTags,
  };
}
