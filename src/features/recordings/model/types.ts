export interface Tag {
  id: string;
  name: string;
  created_at: number;
}

export interface Folder {
  id: string;
  parent_id: string | null;
  name: string;
  created_at: number;
  updated_at: number;
  entry_count: number;
}

export interface Entry {
  id: string;
  folder_id: string;
  storage_path: string;
  display_name: string;
  created_at: number;
  duration_seconds: number | null;
  transcript: string | null;
  title: string | null;
  tags: Tag[];
}

export interface EntryRow {
  id: string;
  folder_id: string;
  storage_path: string;
  display_name: string;
  created_at: number;
  duration_seconds: number | null;
  transcript: string | null;
  title: string | null;
}

export interface EntryTagRecord {
  entry_id: string;
  tag_id: string;
  tag_name: string;
  tag_created_at: number;
}
