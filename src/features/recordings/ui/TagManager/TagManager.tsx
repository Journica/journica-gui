import { Tag } from "../../model/types";
import { SidebarListItem } from "../../../../shared/ui/SidebarListItem";
import { Typography } from "../../../../shared/ui/Typography";
import { TagIcon } from "./TagIcon";
import { useTagManager } from "./useTagManager";

interface Props {
  tags: Tag[];
  selectedFilterTagIds: string[];
  onSelectedFilterTagIdsChange: (tagIds: string[]) => void;
}

export function TagManager({
  tags,
  selectedFilterTagIds,
  onSelectedFilterTagIdsChange,
}: Props) {
  const { handleToggleFilterTag } = useTagManager({
    selectedFilterTagIds,
    onSelectedFilterTagIdsChange,
  });

  return (
    <div>
      {tags.length > 0 && (
        <ul>
          {tags.map((tag) => (
            <SidebarListItem
              key={tag.id}
              asListItem
              icon={<TagIcon />}
              label={tag.name}
              selected={selectedFilterTagIds.includes(tag.id)}
              onClick={() => handleToggleFilterTag(tag.id)}
              title="Toggle tag filter"
              trailing={
                <Typography variant="caption" className="uppercase font-normal leading-3.75 text-dark-30 pr-2">
                  {tag.entry_count}
                </Typography>
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}
