import { useEffect, useRef } from "react";
import { Entry } from "./useEntries";
import { useTranscriptionProgress } from "../transcription/useTranscriptionProgress";
import { useAudioPlayer } from "./useAudioPlayer";
import { formatDuration } from "../../shared/utils/formatDuration";

interface Props {
  entries: Entry[];
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  selectedEntryId: string | null;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onLoadMore: () => void;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
}

export function RecordingsList({
  entries,
  onDelete,
  onSelect,
  selectedEntryId,
  searchQuery,
  onSearchQueryChange,
  onLoadMore,
  loading,
  loadingMore,
  hasMore,
}: Props) {
  const { playingId, audioRef, handlePlay, handleEnded } = useAudioPlayer();
  const progressMap = useTranscriptionProgress();
  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) {
      return;
    }

    const root = listRef.current;
    const sentinel = sentinelRef.current;

    if (!root || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { root, rootMargin: "80px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadingMore, onLoadMore]);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-bold p-4 border-b">Recordings ({entries.length})</h2>
      <div className="p-3 border-b bg-gray-50">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search names and transcripts..."
          className="w-full px-3 py-2 text-sm border rounded bg-white"
        />
      </div>
      <audio ref={audioRef} onEnded={handleEnded} className="hidden" />
      <ul ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading && entries.length === 0 && (
          <li className="p-2 text-sm text-gray-500">Loading recordings...</li>
        )}
        {!loading && entries.length === 0 && (
          <li className="p-2 text-sm text-gray-500">
            {searchQuery.trim() ? "No matching recordings found." : "No recordings yet."}
          </li>
        )}
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={`p-2 rounded cursor-pointer transition-colors ${
              selectedEntryId === entry.id
                ? "bg-blue-100 ring-1 ring-blue-300"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => onSelect(entry.id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm truncate">
                  {entry.title || entry.filename.replace(".wav", "")}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.created_at * 1000).toLocaleString()}<br/>
                  {entry.duration_seconds !== null && (
                    <span className="ml-2">{formatDuration(entry.duration_seconds)}</span>
                  )}
                </div>
                {progressMap[entry.id] !== undefined && (
                  <span>Transcribing: {progressMap[entry.id]}%</span>
                )}

              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePlay(entry);
                  }}
                  className="px-2 py-1 text-blue-500 hover:bg-blue-100 rounded"
                >
                  {playingId === entry.id ? "⏹" : "▶"}
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(entry.id);
                  }}
                  className="px-2 py-1 text-red-500 hover:bg-red-100 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          </li>
        ))}
        {loadingMore && <li className="p-2 text-sm text-gray-500">Loading more...</li>}
        {hasMore && !loading && <li ref={sentinelRef} className="h-1" />}
      </ul>
    </div>
  );
}
