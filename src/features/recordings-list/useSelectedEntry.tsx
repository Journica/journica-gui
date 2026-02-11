import { useEffect, useMemo, useState } from "react";
import { Entry } from "./useEntries";

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface UseSelectedEntryResult {
  selectedEntryId: string | null;
  setSelectedEntryId: (id: string | null) => void;
  selectedEntry: Entry | null;
  highlightedTranscript: React.ReactNode;
}

export function useSelectedEntry(entries: Entry[], searchQuery: string): UseSelectedEntryResult {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (entries.length === 0) {
      setSelectedEntryId(null);
      return;
    }

    if (selectedEntryId && entries.some((entry) => entry.id === selectedEntryId)) {
      return;
    }

    setSelectedEntryId(entries[0].id);
  }, [entries, selectedEntryId]);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  );

  const highlightedTranscript = useMemo(() => {
    if (!selectedEntry?.transcript) {
      return null;
    }

    const terms = searchQuery
      .trim()
      .split(/[^\p{L}\p{N}]+/u)
      .map((token) => token.trim())
      .filter(Boolean)
      .map(escapeRegExp);

    if (terms.length === 0) {
      return selectedEntry.transcript;
    }

    const splitRegex = new RegExp(`(${terms.join("|")})`, "gi");
    const matchRegex = new RegExp(`^(${terms.join("|")})$`, "i");

    return selectedEntry.transcript.split(splitRegex).map((part, index) => {
      if (matchRegex.test(part)) {
        return (
          <mark key={index} className="bg-yellow-200 rounded px-0.5">
            {part}
          </mark>
        );
      }

      return <span key={index}>{part}</span>;
    });
  }, [searchQuery, selectedEntry]);

  return {
    selectedEntryId,
    setSelectedEntryId,
    selectedEntry,
    highlightedTranscript,
  };
}
