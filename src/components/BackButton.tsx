import { ChevronLeft } from 'lucide-react';
import { useT } from '../i18n/dictionary';
import { TapButton } from '../kit/TapButton';

export function BackButton({ onBack, large }: { onBack: () => void; large?: boolean }) {
  const t = useT();
  return (
    <TapButton className={large ? 'back-button back-button-large' : 'back-button'} onTap={onBack}>
      <ChevronLeft strokeWidth={2.5} aria-hidden="true" />
      <span>{t('back')}</span>
    </TapButton>
  );
}
