import { useCallback } from "react";
import { TreeNodeRenderOpts } from "../../../shared/ui/TreeView";
import { Folder } from "../../recordings/model/types";
import { useNewFolderModal } from "./useNewFolderModal";
import { ChevronRightIcon } from "../ui/icons/ChevronRightIcon";
import { FolderIcon } from "../ui/icons/FolderIcon";

interface Params {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
}

export function useNavigationSidebar({ selectedFolderId, onSelectFolder, onCreateFolder }: Params) {
  const newFolderModal = useNewFolderModal({ onCreateFolder });

  const renderUserFolderNode = useCallback(
    ({ node, isExpanded, hasChildren, toggle }: TreeNodeRenderOpts<Folder>) => {
      const isSelected = selectedFolderId === node.id;

      return (
        <button
          className={`w-full text-left px-2 py-1 text-sm rounded flex items-center gap-1 ${isSelected
            ? "bg-light-50 font-semibold"
            : "hover:bg-light-50"
            }`}
          onClick={() => {
            if (hasChildren) {
              toggle();
            }
            onSelectFolder(node.id);
          }}
        >
          {hasChildren ? (
            <span className="w-4 h-4 flex items-center justify-center select-none">
              <ChevronRightIcon expanded={isExpanded} />
            </span>
          ) : (
            <span className="w-4" />
          )}
          <span className="flex w-full items-center gap-1">
            <FolderIcon />
            <span
              style={{ fontWeight: "400" }}
              className="truncate block text-[18px] font-normal leading-[19.5px] tracking-[-0.076px] text-dark-90"
            >
              {node.data.name}
            </span>
          </span>
        </button>
      );
    },
    [selectedFolderId, onSelectFolder],
  );

  return {
    newFolderModal,
    renderUserFolderNode,
  };
}
