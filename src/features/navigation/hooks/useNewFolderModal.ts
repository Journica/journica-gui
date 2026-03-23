import { KeyboardEvent, useCallback, useState } from "react";

interface Params {
  onCreateFolder: (name: string) => Promise<void>;
}

export function useNewFolderModal({ onCreateFolder }: Params) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const open = useCallback(() => {
    setName("");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (isSaving) return;
    setIsOpen(false);
  }, [isSaving]);

  const save = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || isSaving) return;

    try {
      setIsSaving(true);
      await onCreateFolder(trimmed);
      setIsOpen(false);
      setName("");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, name, onCreateFolder]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      void save();
    },
    [save],
  );

  return {
    isOpen,
    name,
    isSaving,
    canSave: !isSaving && name.trim().length > 0,
    open,
    close,
    save,
    handleNameChange,
    handleInputKeyDown,
  };
}
