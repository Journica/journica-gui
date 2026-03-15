DELETE FROM transcript_overrides;
DELETE FROM transcript_segments;
DELETE FROM entry_tags;
DELETE FROM entries;

DROP TRIGGER IF EXISTS entries_ai;
DROP TRIGGER IF EXISTS entries_ad;
DROP TRIGGER IF EXISTS entries_au;
DROP TABLE IF EXISTS entries_fts;

DROP INDEX IF EXISTS idx_entries_folder_id;
DROP INDEX IF EXISTS idx_entries_storage_path;

CREATE TABLE entries_old (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  duration_seconds REAL,
  title TEXT
);

DROP TABLE entries;
ALTER TABLE entries_old RENAME TO entries;

CREATE VIRTUAL TABLE entries_fts USING fts5(
  title,
  filename,
  content='entries',
  content_rowid='rowid'
);

CREATE TRIGGER entries_ai AFTER INSERT ON entries BEGIN
  INSERT INTO entries_fts(rowid, title, filename)
  VALUES (NEW.rowid, NEW.title, NEW.filename);
END;

CREATE TRIGGER entries_ad AFTER DELETE ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, title, filename)
  VALUES ('delete', OLD.rowid, OLD.title, OLD.filename);
END;

CREATE TRIGGER entries_au AFTER UPDATE ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, title, filename)
  VALUES ('delete', OLD.rowid, OLD.title, OLD.filename);
  INSERT INTO entries_fts(rowid, title, filename)
  VALUES (NEW.rowid, NEW.title, NEW.filename);
END;

DROP INDEX IF EXISTS idx_folders_sibling_name;
DROP INDEX IF EXISTS idx_folders_parent_id;
DROP TABLE IF EXISTS folders;
