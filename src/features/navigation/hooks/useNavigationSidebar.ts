import { useCallback, useMemo } from "react";
import { FolderNode } from "../types";
import { flattenNodes } from "../utils";
import { useNewFolderModal } from "./useNewFolderModal";

interface Params {
  selectedFolderId: string | null;
  userNodes: FolderNode[];
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
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
