import { ROOT_FOLDER_ID } from "./constants";
import { Folder, FolderNode } from "./types";

export function buildTree(folders: Folder[]): FolderNode[] {
  const byParent = new Map<string, Folder[]>();

  for (const folder of folders) {
    const parentKey = folder.parent_id ?? "__root__";
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push(folder);
    byParent.set(parentKey, siblings);
  }

  function buildChildren(parentId: string): FolderNode[] {
    const children = byParent.get(parentId) ?? [];
    return children.map((folder) => ({
      id: folder.id,
      data: folder,
      children: buildChildren(folder.id),
    }));
  }

  const rootFolder = folders.find((folder) => folder.id === ROOT_FOLDER_ID);
  if (!rootFolder) return [];

  return buildChildren(ROOT_FOLDER_ID);
}

export function isDateName(name: string): boolean {
  return /^\d{2,4}$/.test(name);
}

export function splitTree(nodes: FolderNode[]): {
  journalNodes: FolderNode[];
  userNodes: FolderNode[];
} {
  const journalNodes: FolderNode[] = [];
  const userNodes: FolderNode[] = [];

  for (const node of nodes) {
    if (isDateName(node.data.name)) {
      journalNodes.push(node);
    } else {
      userNodes.push(node);
    }
  }

  journalNodes.sort((a, b) => b.data.name.localeCompare(a.data.name));

  return { journalNodes, userNodes };
}

export function todayKeys(): { year: string } {
  const now = new Date();
  return {
    year: String(now.getFullYear()).padStart(4, "0"),
  };
}

export function defaultExpanded(journalNodes: FolderNode[]): Set<string> {
  const expanded = new Set<string>();
  const { year } = todayKeys();

  const yearNode = journalNodes.find((node) => node.data.name === year);
  if (!yearNode) return expanded;
  expanded.add(yearNode.id);

  return expanded;
}

export function flattenNodes(nodes: FolderNode[]): FolderNode[] {
  const result: FolderNode[] = [];

  for (const node of nodes) {
    result.push(node);
    result.push(...flattenNodes(node.children));
  }

  return result;
}
