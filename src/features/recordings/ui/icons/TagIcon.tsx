interface Props {
  className?: string;
}

export function TagIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className} fill="none">
      <path
        d="M17.096 9.481 10.519 2.904A1.25 1.25 0 0 0 9.635 2.538H4.167c-.691 0-1.25.56-1.25 1.25v5.468c0 .332.131.65.366.884l6.577 6.577c.488.488 1.279.488 1.768 0l5.468-5.468c.488-.488.488-1.28 0-1.768Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.25"
      />
      <path d="M6.875 6.663a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z" fill="currentColor" />
    </svg>
  );
}
