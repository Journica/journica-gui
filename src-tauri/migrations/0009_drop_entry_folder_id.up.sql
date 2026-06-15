DROP INDEX IF EXISTS idx_entries_folder_id;

ALTER TABLE entries DROP COLUMN folder_id;
