import { KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";
import { Input } from "../../../../shared/ui/Input";
import { Modal } from "../../../../shared/ui/Modal";
import { Tag } from "../../model/types";
import { SidebarListItem } from "../../../../shared/ui/SidebarListItem";
import { Typography } from "../../../../shared/ui/Typography";
import { TagIcon } from "./TagIcon";
import { useTagManager } from "./useTagManager";

interface Props {
  tags: Tag[];
  selectedFilterTagIds: string[];
  onSelectedFilterTagIdsChange: (tagIds: string[]) => void;
  onRenameTag?: (tagId: string, name: string) => Promise<Tag>;
  onDeleteTag?: (tagId: string) => Promise<void>;
}

export function TagManager({
  tags,
  selectedFilterTagIds,
  onSelectedFilterTagIdsChange,
  onRenameTag,
  onDeleteTag,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openMenuTagId, setOpenMenuTagId] = useState<string | null>(null);
  const [tagToRename, setTagToRename] = useState<Tag | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { handleToggleFilterTag } = useTagManager({
    selectedFilterTagIds,
    onSelectedFilterTagIdsChange,
  });

  useEffect(() => {
    if (!openMenuTagId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenMenuTagId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuTagId(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuTagId]);

  const openRenameModal = (tag: Tag) => {
    setTagToRename(tag);
    setRenameValue(tag.name);
    setRenameError(null);
  };

  const closeRenameModal = () => {
    if (isRenaming) {
      return;
    }

    setTagToRename(null);
    setRenameValue("");
    setRenameError(null);
  };

  const saveRename = async () => {
    if (!tagToRename || !onRenameTag || isRenaming) {
      return;
    }

    const trimmedName = renameValue.trim();
    if (!trimmedName) {
      setRenameError("Tag name cannot be empty");
      return;
    }

    if (trimmedName === tagToRename.name) {
      closeRenameModal();
      return;
    }

    setIsRenaming(true);
    setRenameError(null);

    try {
      await onRenameTag(tagToRename.id, trimmedName);
      setTagToRename(null);
      setRenameValue("");
    } catch (error) {
      console.error("Failed to rename tag:", error);
      setRenameError(typeof error === "string" ? error : error instanceof Error ? error.message : "Failed to rename tag");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleRenameKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void saveRename();
    }
  };

  const openDeleteModal = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setTagToDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!tagToDelete || !onDeleteTag || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onDeleteTag(tagToDelete.id);
      setTagToDelete(null);
    } catch (error) {
      console.error("Failed to delete tag:", error);
      setDeleteError(error instanceof Error ? error.message : "Failed to delete tag");
    } finally {
      setIsDeleting(false);
    }
  };

  const renameFooter = (
    <>
      <button
        type="button"
        className="cursor-pointer rounded-lg border border-light-base px-3 py-1.5 text-[13px] font-medium text-dark-90 hover:bg-light-50 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={closeRenameModal}
        disabled={isRenaming}
      >
        Close
      </button>
      <button
        type="button"
        className="cursor-pointer rounded-lg bg-dark-90 px-3 py-1.5 text-[13px] font-medium text-light-10 hover:bg-dark-80 disabled:cursor-not-allowed disabled:bg-dark-20 disabled:text-light-40"
        onClick={() => {
          void saveRename();
        }}
        disabled={!renameValue.trim() || isRenaming}
      >
        {isRenaming ? "Saving..." : "Save"}
      </button>
    </>
  );

  const deleteFooter = (
    <>
      <button
        type="button"
        className="cursor-pointer rounded-lg border border-light-base px-3 py-1.5 text-[13px] font-medium text-dark-90 hover:bg-light-50 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={closeDeleteModal}
        disabled={isDeleting}
      >
        Close
      </button>
      <button
        type="button"
        className="cursor-pointer rounded-lg bg-red-500 px-3 py-1.5 text-[13px] font-medium text-light-10 hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-dark-20 disabled:text-light-40"
        onClick={() => {
          void confirmDelete();
        }}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </>
  );

  return (
    <>
      <div ref={containerRef}>
        {tags.length > 0 && (
          <ul>
            {tags.map((tag) => {
              const isMenuOpen = openMenuTagId === tag.id;

              return (
                <SidebarListItem
                  key={tag.id}
                  asListItem
                  element="div"
                  className="group relative"
                  icon={<TagIcon />}
                  label={tag.name}
                  selected={selectedFilterTagIds.includes(tag.id)}
                  onClick={() => handleToggleFilterTag(tag.id)}
                  title="Toggle tag filter"
                  trailing={
                    <span className="relative flex h-[19.5px] min-w-8 items-center justify-end pr-1">
                      <Typography
                        variant="caption"
                        className={`uppercase font-normal leading-3.75 text-dark-30 pr-1 ${isMenuOpen ? "hidden" : "group-hover:hidden"}`}
                      >
                        {tag.entry_count}
                      </Typography>
                      <button
                        type="button"
                        aria-label={`Open ${tag.name} tag menu`}
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        className={`h-[19.5px] w-6 items-center justify-center rounded text-dark-40 transition-colors hover:bg-light-base hover:text-dark-80 ${
                          isMenuOpen ? "flex" : "hidden group-hover:flex"
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuTagId((current) => (current === tag.id ? null : tag.id));
                        }}
                      >
                        <svg viewBox="0 0 4 16" className="h-4 w-1" aria-hidden="true">
                          <circle cx="2" cy="3" r="1.5" fill="currentColor" />
                          <circle cx="2" cy="8" r="1.5" fill="currentColor" />
                          <circle cx="2" cy="13" r="1.5" fill="currentColor" />
                        </svg>
                      </button>
                      {isMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-0 top-7 z-20 w-32 overflow-hidden rounded-md border border-light-base bg-light-10 shadow-lg"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            role="menuitem"
                            className="block w-full px-3 py-2 text-left text-sm text-dark-80 hover:bg-light-50"
                            onClick={() => {
                              setOpenMenuTagId(null);
                              openRenameModal(tag);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="block w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-light-50"
                            onClick={() => {
                              setOpenMenuTagId(null);
                              openDeleteModal(tag);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </span>
                  }
                />
              );
            })}
          </ul>
        )}
      </div>

      <Modal isOpen={Boolean(tagToRename)} title="Rename Tag" onClose={closeRenameModal} footer={renameFooter} ariaLabel="Rename tag">
        <Input
          value={renameValue}
          onChange={(value) => {
            setRenameValue(value);
            setRenameError(null);
          }}
          onKeyDown={handleRenameKeyDown}
          placeholder="Tag name"
          autoFocus
          className="h-auto w-full gap-0 rounded-lg px-3 py-2"
          inputClassName="text-dark-90"
        />
        {renameError && <p className="mt-2 text-[12px] leading-4 text-red-500">{renameError}</p>}
      </Modal>

      <Modal isOpen={Boolean(tagToDelete)} title="Delete Tag" onClose={closeDeleteModal} footer={deleteFooter} ariaLabel="Delete tag">
        <p className="text-sm leading-5 text-dark-80">
          Delete <span className="font-semibold text-dark-90">{tagToDelete?.name}</span>? This removes the tag from all recordings.
        </p>
        {deleteError && <p className="mt-2 text-[12px] leading-4 text-red-500">{deleteError}</p>}
      </Modal>
    </>
  );
}
