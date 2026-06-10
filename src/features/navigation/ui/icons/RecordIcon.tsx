interface Props {
  className?: string;
}

export function RecordIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}
