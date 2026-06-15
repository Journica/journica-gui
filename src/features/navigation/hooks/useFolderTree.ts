import { useCallback, useEffect, useState } from "react";
import { listFolders } from "../api/navigationApi";
import { Folder } from "../types";
import { buildTree, defaultExpanded, splitTree } from "../utils";

export function useFolderTree() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await listFolders();
      setFolders(result);
    } catch (error) {
      console.error("Failed to load folders:", error);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const topLevel = buildTree(folders);
  const { journalNodes, userNodes } = splitTree(topLevel);

  useEffect(() => {
    if (initialized || journalNodes.length === 0) return;
    setExpandedIds(defaultExpanded(journalNodes));
    setInitialized(true);
  }, [initialized, journalNodes]);

  const toggleExpanded = useCallback((folderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  return {
    journalNodes,
    userNodes,
    expandedIds,
    toggleExpanded,
    selectedFolderId,
    setSelectedFolderId,
    reloadFolders: load,
  };
}
