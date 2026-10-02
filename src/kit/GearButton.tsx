import type { CSSProperties } from 'react';
import { Settings } from 'lucide-react';
import { useT } from '../i18n/dictionary';
import { useHold } from './touch';

export const SETTINGS_HOLD_MS = 3000;

// Caregiver-only control (not used on Home for now): opens something only after a press-and-hold of about 3 seconds, shown by a filling ring.
// A normal tap does nothing. The ring is two half-rings turned with transform (no repaint-heavy animation).
export function GearButton({ onOpen }: { onOpen: () => void }) {
  const t = useT();
  const { handlers, holding } = useHold({ ms: SETTINGS_HOLD_MS, onComplete: onOpen });
  const style = { '--hold-half': `${SETTINGS_HOLD_MS / 2}ms` } as CSSProperties;

  return (
    <button type="button" className="gear" aria-label={t('settingsHold')} {...handlers}>
      <span className="gear-ring" data-active={holding} style={style} aria-hidden="true">
        <span className="ring-half ring-right">
          <span className="ring-fill" />
        </span>
        <span className="ring-half ring-left">
          <span className="ring-fill" />
        </span>
      </span>
      <Settings strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
