import { FolderNode } from "../../../navigation/types";
import { MONTH_LABELS } from "./constants";

export interface FolderOption {
  id: string;
  name: string;
  depth: number;
  entryCount: number;
}

export function formatCreatedAt(createdAtSeconds: number): string {
  const createdAt = new Date(createdAtSeconds * 1000);
  const day = createdAt.getDate();
  const month = MONTH_LABELS[createdAt.getMonth()] ?? "";
  const hour24 = createdAt.getHours();
  const hour12 = hour24 % 12 || 12;
  const minutes = String(createdAt.getMinutes()).padStart(2, "0");
  const period = hour24 >= 12 ? "PM" : "AM";

  return `${day} ${month} ${hour12}:${minutes} ${period}`;
}

export function flattenFolderNodes(nodes: FolderNode[], depth = 0): FolderOption[] {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      name: node.data.name,
      depth,
      entryCount: node.data.entry_count,
    },
    ...flattenFolderNodes(node.children, depth + 1),
  ]);
}
