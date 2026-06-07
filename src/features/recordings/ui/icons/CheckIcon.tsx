interface Props {
  className?: string;
}

export function CheckIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className} fill="none">
      <path d="M16.25 5.625 8.125 13.75 3.75 9.375" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
