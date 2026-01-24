import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { useRef, useState } from "react";
import { Entry } from "./useEntries";

export function useAudioPlayer() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const handlePlay = async (entry: Entry) => {
    if (playingId === entry.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      return;
    }

    try {
      const path = await invoke<string>("get_recording_path", { filename: entry.filename });

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      const fileData = await readFile(path);

      const arrayBuffer = fileData instanceof Uint8Array
        ? fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength)
        : new TextEncoder().encode(String(fileData)).buffer;

      const blob = new Blob([arrayBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setPlayingId(entry.id);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      alert(`Failed to play audio: ${error}`);
    }
  };

  const handleEnded = () => {
    setPlayingId(null);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  return {
    playingId,
    audioRef,
    handlePlay,
    handleEnded,
  };
}
