import { TreeNode } from "../../shared/ui/TreeView";

export interface Folder {
  id: string;
  parent_id: string | null;
  name: string;
  created_at: number;
  updated_at: number;
  entry_count: number;
}

export type FolderNode = TreeNode<Folder>;
