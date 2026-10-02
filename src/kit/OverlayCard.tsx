import { useEffect, useRef, useState, type ReactNode } from 'react';

// A card shown over the softly dimmed screen (level picker, end-of-game cards...). Tapping outside the
// card closes it, unless `dismissable` is false (end cards: only their buttons close them). Fades in and out over --fx-dur (0 under Minimal effects); only opacity is animated.
export interface OverlayCardProps {
  label: string; // accessible name
  onClose: () => void;
  dismissable?: boolean; // default true
  className?: string; // extra class on the card
  children: (close: () => void) => ReactNode; // close() fades out, then calls onClose
}

export function OverlayCard({ label, onClose, dismissable = true, className, children }: OverlayCardProps) {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const close = () => {
    if (leaving) return;
    setLeaving(true);
    const raw = window.getComputedStyle(document.documentElement).getPropertyValue('--fx-dur').trim();
    const ms = raw.endsWith('ms') ? parseFloat(raw) : raw.endsWith('s') ? parseFloat(raw) * 1000 : 0;
    timer.current = window.setTimeout(onClose, Number.isFinite(ms) ? ms : 0);
  };

  return (
    <div
      className="overlay-backdrop"
      data-leaving={leaving}
      onClick={(event) => {
        if (dismissable && event.target === event.currentTarget) close();
      }}
    >
      <div className={className ? `overlay-card ${className}` : 'overlay-card'} role="dialog" aria-modal="true" aria-label={label}>
        {children(close)}
      </div>
    </div>
  );
}
