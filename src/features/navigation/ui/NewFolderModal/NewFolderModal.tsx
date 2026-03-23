import { KeyboardEvent } from "react";
import { Modal } from "../../../../shared/ui/Modal";

interface Props {
  isOpen: boolean;
  value: string;
  isSaving: boolean;
  canSave: boolean;
  onValueChange: (value: string) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSave: () => void;
}

export function NewFolderModal({ isOpen, value, isSaving, canSave, onValueChange, onInputKeyDown, onClose, onSave }: Props) {
  const footer = (
    <>
      <button
        type="button"
        className="cursor-pointer rounded-lg border border-light-base px-3 py-1.5 text-[13px] font-medium text-dark-90 hover:bg-light-50"
        onClick={onClose}
      >
        Close
      </button>
      <button
        type="button"
        className="cursor-pointer rounded-lg bg-dark-90 px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onSave}
        disabled={!canSave}
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} title="New Folder" onClose={onClose} footer={footer} ariaLabel="New folder">
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Folder name"
          className="w-full rounded-lg border border-dark-20 px-3 py-2 text-[14px] leading-5 text-dark-90 outline-none placeholder:text-dark-20 focus:border-dark-30"
        />
    </Modal>
  );
}
