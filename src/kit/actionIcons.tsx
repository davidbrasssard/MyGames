// Icons of the shared game action buttons.
export function HintIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M24 5a13 13 0 0 0-7.5 23.6c1 .8 1.5 1.8 1.5 3V34h12v-2.4c0-1.2.5-2.2 1.5-3A13 13 0 0 0 24 5z"
        fill="#ffd45a"
        stroke="#d99a1c"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M19 39h10M21 43h6" stroke="#5f7f93" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function UndoIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M17 11L8 20l9 9" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20h19a11 11 0 0 1 0 22H20" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShuffleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M6 14h8c10 0 10 20 20 20h8M6 34h8c4 0 6-3 8-6M30 20c1.5-3 3.5-6 8-6h4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M37 8l6 6-6 6M37 28l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
