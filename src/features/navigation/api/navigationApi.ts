import { invoke } from "@tauri-apps/api/core";
import { Folder } from "../types";

export async function listFolders(): Promise<Folder[]> {
  return invoke<Folder[]>("list_folders");
}

export async function createFolder(parentId: string, name: string): Promise<Folder> {
  return invoke<Folder>("create_folder", { parentId, name });
}

export async function renameFolder(folderId: string, name: string): Promise<void> {
  await invoke("rename_folder", { folderId, name });
}

export async function moveFolder(folderId: string, newParentId: string): Promise<void> {
  await invoke("move_folder", { folderId, newParentId });
}

export async function deleteFolder(folderId: string): Promise<void> {
  await invoke("delete_folder", { folderId });
}
