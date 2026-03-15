import { useState } from "react";
import { useRecordingSession } from "./features/recorder";
import { NavigationSidebar, useFolderTree } from "./features/navigation";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    journalNodes,
    expandedIds,
    toggleExpanded,
    selectedFolderId,
    setSelectedFolderId,
    reloadFolders,
  } = useFolderTree();

  const { isRecording, toggleRecording } = useRecordingSession(() => {
    void reloadFolders();
  });

  const handleNewEntry = () => {
    void toggleRecording();
  };

  return (
    <div className="h-screen flex justify-center bg-white">
      <div className="flex w-[960px] h-full">
        <aside className="w-[204px] shrink-0">
          <NavigationSidebar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            isRecording={isRecording}
            onNewEntry={handleNewEntry}
            journalNodes={journalNodes}
            expandedIds={expandedIds}
            selectedFolderId={selectedFolderId}
            onToggleExpanded={toggleExpanded}
            onSelectFolder={setSelectedFolderId}
          />
        </aside>

        <div className="w-[280px] shrink-0 border-r bg-red-200">
        </div>

        <main className="flex-1 min-w-0 bg-green-200">
        </main>
      </div>
    </div>
  );
}

export default App;
