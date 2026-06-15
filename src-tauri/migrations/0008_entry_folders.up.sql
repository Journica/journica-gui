CREATE TABLE IF NOT EXISTS entry_folders (
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (entry_id, folder_id)
);

CREATE INDEX IF NOT EXISTS idx_entry_folders_folder_id ON entry_folders(folder_id);

INSERT OR IGNORE INTO entry_folders (entry_id, folder_id, created_at)
  SELECT id, folder_id, created_at FROM entries;
