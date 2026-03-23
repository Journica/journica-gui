import { KeyboardEventHandler, ReactNode } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  icon?: ReactNode;
  className?: string;
  inputClassName?: string;
}

const BASE_WRAPPER_CLASSNAME = "flex h-7 bg-light-10 self-stretch items-center gap-2 rounded-[22px] border border-dark-20 px-3 py-2";
const BASE_INPUT_CLASSNAME = "min-w-0 flex-1 bg-transparent font-sans text-[14px] font-normal leading-5 tracking-[-0.076px] outline-none text-dark-20 placeholder:text-dark-20";

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
  onKeyDown,
  icon,
  className,
  inputClassName,
}: Props) {
  return (
    <label className={`${BASE_WRAPPER_CLASSNAME} ${className ?? ""}`}>
      {icon}
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`${BASE_INPUT_CLASSNAME} ${inputClassName ?? ""}`}
      />
    </label>
  );
}
