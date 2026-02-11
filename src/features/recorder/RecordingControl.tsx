import { useRecording } from "./useRecording";

interface Props {
  onStop?: () => void;
}

export function RecordingControl({ onStop }: Props) {
  const { isRecording, toggleRecording } = useRecording(onStop);

  return (
    <div className="flex items-center gap-4">
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
        <div className="text-red-500 animate-pulse">Recording...</div>
      )}
    </div>
  );
}
