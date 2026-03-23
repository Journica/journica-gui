import { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  ariaLabel?: string;
}

export function Modal({ isOpen, title, onClose, children, footer, ariaLabel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-90/25 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-light-base bg-white p-4 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold leading-5 text-dark-90">{title}</h3>
          <button type="button" className="cursor-pointer text-dark-30 hover:text-dark-90" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M10.5 3.5L3.5 10.5" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M10.5 10.5L3.5 3.5" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {children}

        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
