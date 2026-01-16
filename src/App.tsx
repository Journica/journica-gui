import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { useEntries } from "./hooks/useEntries";
import { RecordingsList } from "./components/RecordingsList";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const { entries, loadEntries, deleteEntry } = useEntries();

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        await invoke("start_recording");
        console.log("Started recording");
      } else {
        await invoke("stop_recording");
        console.log("Stopped recording");
        await loadEntries();
      }
      setIsRecording(!isRecording);
    } catch (err) {
      console.error(err);
      alert(err);
    }
  };

  return (
    <div className="h-screen flex">
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <button
          className={`px-8 py-4 text-xl rounded-full transition-colors ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          onClick={toggleRecording}
        >
          {isRecording ? "⏹ Stop" : "⏺ Record"}
        </button>
        {isRecording && (
          <div className="mt-4 text-red-500 animate-pulse">Recording...</div>
        )}
      </main>

      <aside className="w-80 border-l bg-gray-50">
        <RecordingsList entries={entries} onDelete={deleteEntry} />
      </aside>
    </div>
  );
}

export default App;
