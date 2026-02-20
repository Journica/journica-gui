import { RecordingControl } from "./features/recorder";
import { RecordingsList, ScriptPanel, useRecordingsPanel } from "./features/recordings-list";

function App() {
  const {
    entries,
    totalEntries,
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
    selectedEntryId,
    setSelectedEntryId,
    selectedEntry,
    highlightedTranscript,
    scriptMessage,
  } = useRecordingsPanel();

  return (
    <div className="h-screen flex">
      <main className="flex-1 flex flex-col min-w-0">
        <div className="border-b p-4 bg-white">
          <RecordingControl onStop={loadEntries} />
        </div>
        <ScriptPanel
          selectedEntry={selectedEntry}
          highlightedTranscript={highlightedTranscript}
          scriptMessage={scriptMessage}
        />
      </main>
      <aside className="w-80 border-l bg-gray-50">
        <RecordingsList
          entries={entries}
          totalEntries={totalEntries}
          tags={tags}
          onDelete={deleteEntry}
          onCreateTag={createTag}
          onDeleteTag={deleteTag}
          onSetEntryTags={setEntryTags}
          onSelect={setSelectedEntryId}
          selectedEntryId={selectedEntryId}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedFilterTagIds={selectedFilterTagIds}
          onSelectedFilterTagIdsChange={setSelectedFilterTagIds}
          onLoadMore={loadMore}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
        />
      </aside>
    </div>
  );
}

export default App;
