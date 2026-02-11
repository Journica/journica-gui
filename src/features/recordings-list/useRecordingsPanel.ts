import { useMemo } from "react";
import { useEntries } from "./useEntries";
import { useSelectedEntry } from "./useSelectedEntry";

export function useRecordingsPanel() {
  const {
    entries,
    loading,
    loadingMore,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadEntries,
    loadMore,
    deleteEntry,
  } = useEntries();

  const { selectedEntryId, setSelectedEntryId, selectedEntry, highlightedTranscript } = useSelectedEntry(
    entries,
    searchQuery,
  );

  const scriptMessage = useMemo(() => {
    if (!selectedEntry) {
      if (searchQuery.trim()) {
        return "No matching recordings found for this search.";
      }

      return "Select a recording from the side panel to view its script.";
    }

    if (!selectedEntry.transcript) {
      return "No script available yet for this recording.";
    }

    return null;
  }, [searchQuery, selectedEntry]);

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
    selectedEntryId,
    setSelectedEntryId,
    selectedEntry,
    highlightedTranscript,
    scriptMessage,
  };
}
