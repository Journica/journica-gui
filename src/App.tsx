import { NavigationSidebar } from "./features/navigation";
import { RecordingsSidebar, ScriptPanel } from "./features/recordings";
import { useAppController } from "./hooks/useAppController";

function App() {
  const {
    folderSearchQuery,
    setFolderSearchQuery,
    journalNodes,
    userNodes,
    expandedIds,
    toggleExpanded,
    selectedFolderId,
    setSelectedFolderId,
    isRecording,
    onNewEntry,
    onCreateFolder,
    onDeleteEntry,
    onLoadMore,
    recordingsPanel,
  } = useAppController();

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        <aside className="md:min-w-56 md:basis-1/5 md:max-w-sm">
          <NavigationSidebar
            searchQuery={folderSearchQuery}
            onSearchQueryChange={setFolderSearchQuery}
            isRecording={isRecording}
            onNewEntry={onNewEntry}
            totalEntries={recordingsPanel.totalEntries}
            journalNodes={journalNodes}
            userNodes={userNodes}
            expandedIds={expandedIds}
            selectedFolderId={selectedFolderId}
            onToggleExpanded={toggleExpanded}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={onCreateFolder}
          />
        </aside>

        <div className="min-h-40 border-r md:min-w-72 md:basis-1/4">
          <RecordingsSidebar
            entries={recordingsPanel.entries}
            totalEntries={recordingsPanel.totalEntries}
            tags={recordingsPanel.tags}
            selectedEntry={recordingsPanel.selectedEntry}
            selectedEntryId={recordingsPanel.selectedEntryId}
            searchQuery={recordingsPanel.searchQuery}
            selectedFilterTagIds={recordingsPanel.selectedFilterTagIds}
            loading={recordingsPanel.loading}
            loadingMore={recordingsPanel.loadingMore}
            hasMore={recordingsPanel.hasMore}
            onDeleteEntry={onDeleteEntry}
            onCreateTag={recordingsPanel.createTag}
            onDeleteTag={recordingsPanel.deleteTag}
            onSetEntryTags={recordingsPanel.setEntryTags}
            onSelectEntry={recordingsPanel.setSelectedEntryId}
            onSearchQueryChange={recordingsPanel.setSearchQuery}
            onSelectedFilterTagIdsChange={recordingsPanel.setSelectedFilterTagIds}
            onLoadMore={onLoadMore}
          />
        </div>

        <main className="min-h-40 flex flex-1 min-w-0">
          <ScriptPanel
            selectedEntry={recordingsPanel.selectedEntry}
            searchQuery={recordingsPanel.searchQuery}
            scriptMessage={recordingsPanel.scriptMessage}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
