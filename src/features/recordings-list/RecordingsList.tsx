import { useEffect, useRef, useState } from "react";
import { Entry, Tag } from "./useEntries";
import { useTranscriptionProgress } from "../transcription/useTranscriptionProgress";
import { useAudioPlayer } from "./useAudioPlayer";
import { formatDuration } from "../../shared/utils/formatDuration";

interface Props {
  entries: Entry[];
  totalEntries: number;
  tags: Tag[];
  onDelete: (id: string) => void;
  onCreateTag: (name: string) => Promise<Tag>;
  onDeleteTag: (tagId: string) => Promise<void>;
  onSetEntryTags: (entryId: string, tagIds: string[]) => Promise<void>;
  onSelect: (id: string) => void;
  selectedEntryId: string | null;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedFilterTagIds: string[];
  onSelectedFilterTagIdsChange: (tagIds: string[]) => void;
  onLoadMore: () => void;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
}

export function RecordingsList({
  entries,
  totalEntries,
  tags,
  onDelete,
  onCreateTag,
  onDeleteTag,
  onSetEntryTags,
  onSelect,
  selectedEntryId,
  searchQuery,
  onSearchQueryChange,
  selectedFilterTagIds,
  onSelectedFilterTagIdsChange,
  onLoadMore,
  loading,
  loadingMore,
  hasMore,
}: Props) {
  const { playingId, audioRef, handlePlay, handleEnded } = useAudioPlayer();
  const progressMap = useTranscriptionProgress();
  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [updatingEntryId, setUpdatingEntryId] = useState<string | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? null;

  const handleCreateTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) {
      return;
    }

    setIsCreatingTag(true);
    try {
      await onCreateTag(trimmed);
      setNewTagName("");
    } catch (error) {
      alert(error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    setDeletingTagId(tagId);
    try {
      await onDeleteTag(tagId);
    } catch (error) {
      alert(error);
    } finally {
      setDeletingTagId(null);
    }
  };

  const handleToggleEntryTag = async (entry: Entry, tagId: string) => {
    const selectedTagIds = entry.tags.map((tag) => tag.id);
    const alreadySelected = selectedTagIds.includes(tagId);
    const nextTagIds = alreadySelected
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];

    setUpdatingEntryId(entry.id);
    try {
      await onSetEntryTags(entry.id, nextTagIds);
    } catch (error) {
      alert(error);
    } finally {
      setUpdatingEntryId(null);
    }
  };

  const handleToggleFilterTag = (tagId: string) => {
    const exists = selectedFilterTagIds.includes(tagId);
    const nextTagIds = exists
      ? selectedFilterTagIds.filter((id) => id !== tagId)
      : [...selectedFilterTagIds, tagId];
    onSelectedFilterTagIdsChange(nextTagIds);
  };

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
      <h2 className="text-lg font-bold p-4 border-b">Recordings ({entries.length}/{totalEntries})</h2>
      <div className="p-3 border-b bg-gray-50">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search names, transcripts, tags..."
          className="w-full px-3 py-2 text-sm border rounded bg-white"
        />
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="Create tag"
              className="flex-1 px-3 py-2 text-sm border rounded bg-white"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleCreateTag();
                }
              }}
            />
            <button
              onClick={() => {
                void handleCreateTag();
              }}
              disabled={isCreatingTag || !newTagName.trim()}
              className="px-3 py-2 text-sm rounded bg-blue-500 text-white disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag.id} className="inline-flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFilterTag(tag.id)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      selectedFilterTagIds.includes(tag.id) ? "text-white" : "text-gray-800"
                    } ${
                      selectedFilterTagIds.includes(tag.id)
                        ? "bg-blue-600 border-blue-600"
                        : "bg-gray-200 border-gray-300 text-gray-800"
                    }`}
                    title="Toggle tag filter"
                  >
                    {tag.name}
                  </button>
                  <button
                    onClick={() => {
                      void handleDeleteTag(tag.id);
                    }}
                    disabled={deletingTagId === tag.id}
                    className="text-red-500 text-xs disabled:opacity-50"
                    title="Delete tag"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          {selectedEntry && tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-2">Edit tags for selected recording</div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => {
                  const isSelected = selectedEntry.tags.some((entryTag) => entryTag.id === tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        void handleToggleEntryTag(selectedEntry, tag.id);
                      }}
                      disabled={updatingEntryId === selectedEntry.id}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        isSelected
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      } disabled:opacity-50`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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
                {entry.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
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
