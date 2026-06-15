import { useCallback, useState } from "react";
import { useFolderTree } from "../features/navigation";
import { useRecordingsPanel } from "../features/recordings";
import { useRecordingSession } from "../features/recorder";

export function useAppController() {
  const [folderSearchQuery, setFolderSearchQuery] = useState("");

  const {
    journalNodes,
    expandedIds,
    toggleExpanded,
    selectedFolderId,
    setSelectedFolderId,
    reloadFolders,
  } = useFolderTree();

  const recordingsPanel = useRecordingsPanel(selectedFolderId);

  const {
    isRecording,
    isPaused: isRecordingPaused,
    durationSeconds: recordingDurationSeconds,
    toggleRecording,
    stopCurrentRecording,
  } = useRecordingSession(() => {
    void reloadFolders();
    void recordingsPanel.loadEntries();
  });

  const onNewEntry = useCallback(() => {
    void toggleRecording();
  }, [toggleRecording]);

  const onStopEntry = useCallback(() => {
    if (isRecording) {
      void stopCurrentRecording();
    }
  }, [isRecording, stopCurrentRecording]);

  const onDeleteEntry = useCallback(
    async (id: string) => {
      await recordingsPanel.deleteEntry(id);
      await reloadFolders();
    },
    [recordingsPanel, reloadFolders],
  );

  const onLoadMore = useCallback(() => {
    void recordingsPanel.loadMore();
  }, [recordingsPanel]);

  return {
    folderSearchQuery,
    setFolderSearchQuery,
    journalNodes,
    expandedIds,
    toggleExpanded,
    selectedFolderId,
    setSelectedFolderId,
    isRecording,
    isRecordingPaused,
    recordingDurationSeconds,
    onNewEntry,
    onStopEntry,
    onDeleteEntry,
    onLoadMore,
    recordingsPanel,
  };
}
