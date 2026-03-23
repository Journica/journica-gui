import { TreeView } from "../../../../shared/ui/TreeView";
import { Typography } from "../../../../shared/ui/Typography";
import { FolderNode } from "../../hooks/useFolderTree";
import { useNavigationSidebar } from "../../hooks/useNavigationSidebar";
import { Folder } from "../../../recordings/model/types";
import { JournalTree } from "../JournalTree";
import { NewFolderModal } from "../NewFolderModal";
import { NavigationSearch } from "../NavigationSearch";
import { PlusIcon } from "../icons/PlusIcon";

interface Props {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  isRecording: boolean;
  onNewEntry: () => void;
  totalEntries: number;
  journalNodes: FolderNode[];
  userNodes: FolderNode[];
  expandedIds: Set<string>;
  selectedFolderId: string | null;
  onToggleExpanded: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
}

export function NavigationSidebar({
  searchQuery,
  onSearchQueryChange,
  isRecording,
  onNewEntry,
  totalEntries,
  journalNodes,
  userNodes,
  expandedIds,
  selectedFolderId,
  onToggleExpanded,
  onSelectFolder,
  onCreateFolder,
}: Props) {
  const { newFolderModal, renderUserFolderNode } = useNavigationSidebar({
    selectedFolderId,
    onSelectFolder,
    onCreateFolder,
  });

  return (
    <div className="h-full flex flex-col bg-light-50 border-r">
      <div className="p-3">
        <NavigationSearch value={searchQuery} onChange={onSearchQueryChange} />
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={onNewEntry}
          className="mx-auto flex w-full items-center justify-center gap-1.5 rounded-[22px] bg-dark-90 px-3 py-2.25 text-sm font-semibold text-white transition-colors hover:opacity-90 cursor-pointer"
        >
          <div className="flex gap-1.5 justify-center items-center font-normal text-[13px] tracking-[-0.076px]">
            <span aria-hidden>+</span>
            <span>{isRecording ? "Stop Recording" : "New Entry"}</span>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="mb-3 [&>*]:text-[15px] flex justify-between text-center ">
          <Typography variant="caption" className="uppercase font-normal leading-3.75 text-dark-30">
            Journal
          </Typography>
          <Typography variant="caption" className="uppercase font-normal leading-3.75 text-dark-30">
            {totalEntries}
          </Typography>
        </div>
        <JournalTree
          nodes={journalNodes}
          expandedIds={expandedIds}
          selectedFolderId={selectedFolderId}
          onToggleExpanded={onToggleExpanded}
          onSelectFolder={onSelectFolder}
        />

        <hr className="my-3 border-light-base" />

        <div className="[&>*]:text-[15px] flex justify-between text-center">
          <Typography variant="caption" className="uppercase font-normal leading-3.75 text-dark-30">
            Folders
          </Typography>
          <PlusIcon className="cursor-pointer text-dark-30" onClick={newFolderModal.open} />
        </div>

        <TreeView<Folder>
          nodes={userNodes}
          expandedIds={expandedIds}
          onToggleExpanded={onToggleExpanded}
          renderNode={renderUserFolderNode}
          childClassName="ml-3"
        />
      </div>

      <NewFolderModal
        isOpen={newFolderModal.isOpen}
        value={newFolderModal.name}
        isSaving={newFolderModal.isSaving}
        canSave={newFolderModal.canSave}
        onValueChange={newFolderModal.handleNameChange}
        onInputKeyDown={newFolderModal.handleInputKeyDown}
        onClose={newFolderModal.close}
        onSave={() => {
          void newFolderModal.save();
        }}
      />
    </div>
  );
}
