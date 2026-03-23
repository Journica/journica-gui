import { KeyboardEvent, useCallback, useState } from "react";

interface Params {
  onCreateFolder: (name: string) => Promise<void>;
}

export function useNewFolderModal({ onCreateFolder }: Params) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const open = useCallback(() => {
    setName("");
    setErrorMessage(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (isSaving) return;
    setErrorMessage(null);
    setIsOpen(false);
  }, [isSaving]);

  const save = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || isSaving) return;

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await onCreateFolder(trimmed);
      setIsOpen(false);
      setName("");
    } catch (error) {
      const rawMessage =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Failed to create folder";

      if (/idx_folders_sibling_name|unique constraint failed/i.test(rawMessage)) {
        setErrorMessage("Folder already exists");
      } else {
        setErrorMessage("Failed to create folder");
      }
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, name, onCreateFolder]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [errorMessage]);

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
    errorMessage,
    canSave: !isSaving && name.trim().length > 0,
    open,
    close,
    save,
    handleNameChange,
    handleInputKeyDown,
  };
}
