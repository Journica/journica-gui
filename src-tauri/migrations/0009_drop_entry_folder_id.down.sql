ALTER TABLE entries ADD COLUMN folder_id TEXT;

UPDATE entries
  SET folder_id = (
    SELECT folder_id
    FROM entry_folders
    WHERE entry_folders.entry_id = entries.id
    ORDER BY created_at ASC
    LIMIT 1
  );

CREATE INDEX IF NOT EXISTS idx_entries_folder_id ON entries(folder_id);
