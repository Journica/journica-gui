import { RecordingControl } from "./features/recorder";
import { RecordingsList, ScriptPanel, useRecordingsPanel } from "./features/recordings-list";

function App() {
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
          onDelete={deleteEntry}
          onSelect={setSelectedEntryId}
          selectedEntryId={selectedEntryId}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
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
