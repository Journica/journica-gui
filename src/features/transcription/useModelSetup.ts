import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { ModelDownloadProgress } from "./types";

export function useModelSetup() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<ModelDownloadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [setupAttempt, setSetupAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const unlistenProgress = listen<ModelDownloadProgress>("model-download-progress", (event) => {
      if (!cancelled) {
        setProgress(event.payload);
      }
    });

    setErrorMessage(null);
    void invoke("ensure_transcription_model")
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
      unlistenProgress.then((unlisten) => {
        unlisten();
      });
    };
  }, [setupAttempt]);

  return {
    ready,
    progress,
    errorMessage,
    retry: () => {
      setSetupAttempt((attempt) => attempt + 1);
    },
  };
}
