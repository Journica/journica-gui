export interface ModelDownloadProgress {
  downloaded_bytes: number;
  total_bytes: number | null;
  progress: number | null;
}

export interface TranscriptionProgress {
  entry_id: string;
  progress: number;
}
