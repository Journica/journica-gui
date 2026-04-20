import { KeyboardEvent, ReactNode } from "react";

interface Props {
  label: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  className?: string;
  title?: string;
  asListItem?: boolean;
  element?: "button" | "div";
  selectedClassName?: string;
  unselectedClassName?: string;
  unstyledLabel?: boolean;
  contentClassName?: string;
}

function joinClasses(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

export function SidebarListItem({
  label,
  onClick,
  icon,
  leading,
  trailing,
  selected = false,
  className,
  title,
  asListItem = false,
  element = "button",
  selectedClassName = "bg-light-50 font-semibold hover:bg-light-80",
  unselectedClassName = "hover:bg-light-80",
  unstyledLabel = false,
  contentClassName,
}: Props) {
  const baseClassName = joinClasses(
    "w-full text-left py-1 text-sm rounded flex items-center gap-1 transition-colors",
    selected ? selectedClassName : unselectedClassName,
    className,
  );

  const labelNode = unstyledLabel ? (
    label
  ) : (
    <span
      style={{ fontWeight: "400" }}
      className="truncate block text-[18px] font-normal leading-[19.5px] tracking-[-0.076px] text-dark-90"
    >
      {label}
    </span>
  );

  const content = (
    <>
      {leading}
      <span className={joinClasses("flex w-full min-w-0 items-center justify-between gap-2", contentClassName)}>
        <span className="flex min-w-0 items-center gap-1">
          {icon}
          {labelNode}
        </span>
        {trailing}
      </span>
    </>
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const item =
    element === "div" ? (
      <div className={baseClassName} onClick={onClick} onKeyDown={handleKeyDown} title={title} role="button" tabIndex={0}>
        {content}
      </div>
    ) : (
      <button type="button" className={baseClassName} onClick={onClick} title={title}>
        {content}
      </button>
    );

  if (asListItem) {
    return <li>{item}</li>;
  }

  return item;
}
