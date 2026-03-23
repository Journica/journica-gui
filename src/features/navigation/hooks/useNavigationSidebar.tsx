import { useCallback, useMemo } from "react";
import { FolderNode } from "./useFolderTree";
import { useNewFolderModal } from "./useNewFolderModal";

interface Params {
  selectedFolderId: string | null;
  userNodes: FolderNode[];
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
}

function flattenNodes(nodes: FolderNode[]): FolderNode[] {
  const result: FolderNode[] = [];

  for (const node of nodes) {
    result.push(node);
    result.push(...flattenNodes(node.children));
  }

  return result;
}

export function useNavigationSidebar({ selectedFolderId, userNodes, onSelectFolder, onCreateFolder }: Params) {
  const newFolderModal = useNewFolderModal({ onCreateFolder });

  const flatUserNodes = useMemo(() => flattenNodes(userNodes), [userNodes]);

  const onSelectUserFolder = useCallback(
    (folderId: string) => {
      onSelectFolder(folderId);
    },
    [onSelectFolder],
  );

  const isUserFolderSelected = useCallback(
    (folderId: string) => selectedFolderId === folderId,
    [selectedFolderId],
  );

  return {
    newFolderModal,
    flatUserNodes,
    onSelectUserFolder,
    isUserFolderSelected,
  };
}
