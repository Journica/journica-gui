import { useMemo } from "react";
import { formatDuration } from "../../../../shared/utils/formatDuration";
import { Entry } from "../../model/types";

interface UseEntryListItemParams {
  entry: Entry;
}

export function useEntryListItem({ entry }: UseEntryListItemParams) {
  const displayTitle = useMemo(() => entry.title || entry.display_name, [
    entry.display_name,
    entry.title,
  ]);
  const createdAtLabel = useMemo(() => new Date(entry.created_at * 1000).toLocaleString(), [entry.created_at]);
  const durationLabel = useMemo(() => formatDuration(entry.duration_seconds), [entry.duration_seconds]);

  return {
    displayTitle,
    createdAtLabel,
    durationLabel,
  };
}
