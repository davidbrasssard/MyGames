import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { EFFECT_PROFILES } from './motion';
import { useSettings } from '../settings/settings';

// Shows one screen at a time. When the screen changes, the old one fades out and the
// new one fades in (opacity and a small lift only; length follows the Effects setting).
export function ScreenHost({ screenKey, children }: { screenKey: string; children: ReactNode }) {
  const { effects } = useSettings();
  const [shownKey, setShownKey] = useState(screenKey);
  const [leaving, setLeaving] = useState(false);
  const shownNode = useRef<ReactNode>(children);

  if (shownKey === screenKey) shownNode.current = children;

  useEffect(() => {
    if (shownKey === screenKey) {
      setLeaving(false); // navigated back to the current screen mid-fade
      return undefined;
    }
    setLeaving(true);
    const timer = window.setTimeout(() => {
      setShownKey(screenKey);
      setLeaving(false);
    }, EFFECT_PROFILES[effects].fadeMs);
    return () => window.clearTimeout(timer);
  }, [screenKey, shownKey, effects]);

  return (
    <div key={shownKey} className={leaving ? 'screen screen-leaving' : 'screen'}>
      {shownNode.current}
    </div>
  );
}
