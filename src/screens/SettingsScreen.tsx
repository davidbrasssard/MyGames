import { BackButton } from '../components/BackButton';
import { Segmented, Switch } from '../components/Controls';
import { getGame } from '../games/registry';
import { useT, type TextKey } from '../i18n/dictionary';
import { RELEASE_DIFFICULTY_GAMES, RELEASE_VISIBLE_SETTINGS } from '../settings/release';
import { DIFFICULTIES, setDifficulty, updateSettings, useSettings, type Difficulty, type Language } from '../settings/settings';

const LEVEL_KEYS: Record<Difficulty, TextKey> = {
  easy: 'levelEasy',
  medium: 'levelMedium',
  hard: 'levelHard',
  veryHard: 'levelVeryHard',
};

// Changes save and apply immediately (the store writes to the device on every change).
export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  const settings = useSettings();
  const show = (name: (typeof RELEASE_VISIBLE_SETTINGS)[number]) => RELEASE_VISIBLE_SETTINGS.includes(name);

  return (
    <div className="settings">
      <header className="settings-bar">
        <BackButton onBack={onBack} />
        <h1 className="settings-title">{t('settings')}</h1>
      </header>

      <div className="settings-list">
        {show('language') && (
          <section className="panel setting-card">
            <h2 className="setting-label">{t('language')}</h2>
            <Segmented<Language>
              label={t('language')}
              value={settings.language}
              onChange={(language) => updateSettings({ language })}
              options={[
                { value: 'fr', label: t('langFr') },
                { value: 'en', label: t('langEn') },
              ]}
            />
          </section>
        )}

        {show('difficulty') &&
          RELEASE_DIFFICULTY_GAMES.map((gameId) => (
            <section key={gameId} className="panel setting-card">
              <h2 className="setting-label">
                {t('difficulty')} <span className="setting-sub">· {t(getGame(gameId).nameKey)}</span>
              </h2>
              <Segmented<Difficulty>
                label={t('difficulty')}
                value={settings.difficulty[gameId]}
                onChange={(level) => setDifficulty(gameId, level)}
                options={DIFFICULTIES.map((level) => ({ value: level, label: t(LEVEL_KEYS[level]) }))}
              />
            </section>
          ))}

        {show('sound') && (
          <section className="panel setting-card setting-card-row">
            <h2 className="setting-label">{t('sound')}</h2>
            <Switch
              label={t('sound')}
              checked={settings.sound}
              onChange={(sound) => updateSettings({ sound })}
              stateLabel={settings.sound ? t('on') : t('off')}
            />
          </section>
        )}
      </div>
    </div>
  );
}
