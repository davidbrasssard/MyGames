// Simple illustrated game icons (placeholders until the real picture system lands).
export function MatchIcon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <g transform="rotate(-10 34 52)">
        <rect x="10" y="22" width="46" height="56" rx="9" fill="#fff" stroke="#c9d9e6" strokeWidth="2" />
        <circle cx="33" cy="50" r="12" fill="#f4b73a" />
        <circle cx="33" cy="50" r="5" fill="#a5651d" />
      </g>
      <g transform="rotate(9 64 48)">
        <rect x="42" y="16" width="46" height="56" rx="9" fill="#fff" stroke="#c9d9e6" strokeWidth="2" />
        <circle cx="65" cy="44" r="12" fill="#e66a9a" />
        <circle cx="65" cy="44" r="5" fill="#f9d5e2" />
      </g>
    </svg>
  );
}

export function MahjongIcon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <g>
        <rect x="8" y="18" width="42" height="56" rx="8" fill="#e9dfc7" />
        <rect x="8" y="14" width="42" height="56" rx="8" fill="#fffaf0" stroke="#d8cdb2" strokeWidth="2" />
        <path d="M29 60C21 50 21 38 29 26c8 12 8 24 0 34z" fill="#4fae5d" />
        <path d="M29 56V32" stroke="#2f7f3d" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g>
        <rect x="46" y="30" width="42" height="56" rx="8" fill="#e9dfc7" />
        <rect x="46" y="26" width="42" height="56" rx="8" fill="#fffaf0" stroke="#d8cdb2" strokeWidth="2" />
        <circle cx="67" cy="54" r="6" fill="#f4b73a" />
        <circle cx="67" cy="40" r="6" fill="#e66a9a" />
        <circle cx="67" cy="68" r="6" fill="#e66a9a" />
        <circle cx="53" cy="54" r="6" fill="#e66a9a" />
        <circle cx="81" cy="54" r="6" fill="#e66a9a" />
      </g>
    </svg>
  );
}

export function Match3Icon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <circle cx="30" cy="34" r="17" fill="#e8483f" />
      <circle cx="30" cy="34" r="6" fill="#f6a39c" />
      <circle cx="66" cy="34" r="17" fill="#f4b73a" />
      <circle cx="66" cy="34" r="6" fill="#fbe2a3" />
      <path d="M48 52c-13 14-19 22-19 29a19 19 0 0 0 38 0c0-7-6-15-19-29z" fill="#3f8fe0" />
      <ellipse cx="42" cy="72" rx="4" ry="6" fill="#a9d1f7" />
    </svg>
  );
}

export function PuzzlesIcon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <rect x="10" y="10" width="36" height="36" rx="7" fill="#6fb6e8" />
      <rect x="50" y="10" width="36" height="36" rx="7" fill="#8fcf8a" />
      <rect x="10" y="50" width="36" height="36" rx="7" fill="#f4b73a" />
      <rect x="50" y="50" width="36" height="36" rx="7" fill="#fff" stroke="#c9d9e6" strokeWidth="3" strokeDasharray="6 6" />
    </svg>
  );
}

export function LeafIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 54C8 28 26 10 56 8c2 30-16 48-46 46z" fill="#3f9d5a" />
      <path d="M14 50L46 18" stroke="#d9f0df" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#2d5d78"
        d="M27.5 4h-7l-1.2 5.3a15 15 0 0 0-3.6 2.1L10.5 9.8 7 15.9l4 3.7a15 15 0 0 0 0 4.8l-4 3.7 3.5 6.1 5.2-1.6a15 15 0 0 0 3.6 2.1L20.5 44h7l1.2-5.3a15 15 0 0 0 3.6-2.1l5.2 1.6 3.5-6.1-4-3.7a15 15 0 0 0 0-4.8l4-3.7-3.5-6.1-5.2 1.6a15 15 0 0 0-3.6-2.1L27.5 4zM24 16.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15z"
      />
    </svg>
  );
}

export function ChevronIcon({ direction }: { direction: 'left' | 'right' | 'down' }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" style={{ transform: direction === 'right' ? 'rotate(180deg)' : direction === 'down' ? 'rotate(-90deg)' : undefined }}>
      <path d="M20 5L9 16l11 11" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Speaker: with sound waves when on, with a cross when off. Uses currentColor.
export function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="currentColor" d="M6 18h8l10-8v28l-10-8H6z" />
      {on ? (
        <path d="M31 17a10 10 0 0 1 0 14M36 11a18 18 0 0 1 0 26" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M31 18l11 12M42 18L31 30" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      )}
    </svg>
  );
}
