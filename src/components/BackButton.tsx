import { ChevronIcon } from '../games/icons';
import { useT } from '../i18n/dictionary';
import { TapButton } from '../kit/TapButton';

export function BackButton({ onBack, large }: { onBack: () => void; large?: boolean }) {
  const t = useT();
  return (
    <TapButton className={large ? 'back-button back-button-large' : 'back-button'} onTap={onBack}>
      <ChevronIcon direction="left" />
      <span>{t('back')}</span>
    </TapButton>
  );
}
