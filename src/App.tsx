import { useEffect, useMemo, useState } from "react";
import { RecordingControl } from "./features/recorder";
import { RecordingsList, useEntries } from "./features/recordings-list";

function App() {
  const { entries, loadEntries, deleteEntry } = useEntries();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (entries.length === 0) {
      setSelectedEntryId(null);
      return;
    }

    if (selectedEntryId && entries.some((entry) => entry.id === selectedEntryId)) {
      return;
    }

    const mostRecentEntry = entries.reduce((latest, current) =>
      current.created_at > latest.created_at ? current : latest,
    );

    setSelectedEntryId(mostRecentEntry.id);
  }, [entries, selectedEntryId]);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  );

  return (
    <div className="h-screen flex">
      <main className="flex-1 flex flex-col min-w-0">
        <div className="border-b p-4 bg-white">
          <RecordingControl onStop={loadEntries} />
        </div>
        <section className="flex-1 overflow-y-auto p-6 bg-white">
          <h2 className="text-lg font-bold mb-3">Script</h2>
          {!selectedEntry && (
            <p className="text-gray-500">Select a recording from the side panel to view its script.</p>
          )}
          {selectedEntry && !selectedEntry.transcript && (
            <p className="text-gray-500">No script available yet for this recording.</p>
          )}
          {selectedEntry?.transcript && (
            <p className="whitespace-pre-wrap leading-relaxed">{selectedEntry.transcript}</p>
          )}
        </section>
      </main>
      <aside className="w-80 border-l bg-gray-50">
        <RecordingsList
          entries={entries}
          onDelete={deleteEntry}
          onSelect={setSelectedEntryId}
          selectedEntryId={selectedEntryId}
        />
      </aside>
    </div>
  );
}

export default App;
