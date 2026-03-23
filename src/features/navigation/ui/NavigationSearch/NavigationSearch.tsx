import { Input } from "../../../../shared/ui/Input";
import { SearchIcon } from "../icons/SearchIcon";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function NavigationSearch({ value, onChange, placeholder = "Search" }: Props) {
  return (
    <Input value={value} onChange={onChange} placeholder={placeholder} icon={<SearchIcon />} />
  );
}
