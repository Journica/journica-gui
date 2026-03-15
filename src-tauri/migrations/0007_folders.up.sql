CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES folders(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX idx_folders_sibling_name
  ON folders(COALESCE(parent_id, ''), normalized_name);

CREATE INDEX idx_folders_parent_id ON folders(parent_id);

INSERT INTO folders (id, parent_id, name, normalized_name, created_at, updated_at)
  VALUES ('root', NULL, 'Root', 'root', 0, 0);

DELETE FROM transcript_overrides;
DELETE FROM transcript_segments;
DELETE FROM entry_tags;
DELETE FROM entries;

DROP TRIGGER IF EXISTS entries_ai;
DROP TRIGGER IF EXISTS entries_ad;
DROP TRIGGER IF EXISTS entries_au;
DROP TABLE IF EXISTS entries_fts;

CREATE TABLE entries_new (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE RESTRICT,
  storage_path TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  duration_seconds REAL,
  title TEXT
);

DROP TABLE entries;
ALTER TABLE entries_new RENAME TO entries;

CREATE INDEX idx_entries_folder_id ON entries(folder_id);
CREATE UNIQUE INDEX idx_entries_storage_path ON entries(storage_path);

CREATE VIRTUAL TABLE entries_fts USING fts5(
  title,
  display_name,
  content='entries',
  content_rowid='rowid'
);

CREATE TRIGGER entries_ai AFTER INSERT ON entries BEGIN
  INSERT INTO entries_fts(rowid, title, display_name)
  VALUES (NEW.rowid, NEW.title, NEW.display_name);
END;

CREATE TRIGGER entries_ad AFTER DELETE ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, title, display_name)
  VALUES ('delete', OLD.rowid, OLD.title, OLD.display_name);
END;

CREATE TRIGGER entries_au AFTER UPDATE ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, title, display_name)
  VALUES ('delete', OLD.rowid, OLD.title, OLD.display_name);
  INSERT INTO entries_fts(rowid, title, display_name)
  VALUES (NEW.rowid, NEW.title, NEW.display_name);
END;
