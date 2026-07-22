import { ChevronLeft, Moon, Palette, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_OPTIONS } from '../../../constants/language'
import { FONT_SCALE } from '../../../constants/accessibility'
import { THEME_MODE } from '../../../constants/theme'

function StudentInterfaceSettingsCard({
  language,
  onLanguageChange,
  themeMode,
  onThemeModeChange,
  highContrast,
  onHighContrastChange,
  fontScale,
  onFontScaleChange,
}) {
  const { t } = useTranslation(['student', 'common', 'settings'])
  const percent = Math.round(Number(fontScale) * 100)
  const isLight = themeMode === THEME_MODE.LIGHT

  return (
    <section className="rounded-2xl bg-[var(--shell-surface)] p-6 shadow-[var(--shell-shadow-sm)] ring-1 ring-[var(--shell-border)] md:p-7">
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
          <Palette className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-[var(--shell-text)]">
            {t('settingsPage.interface.title')}
          </h2>
          <p className="mt-1 text-sm leading-7 text-[var(--shell-text-muted)]">
            {t('settingsPage.interface.subtitle')}
          </p>
        </div>
      </header>

      <div className="space-y-0">
        <div className="flex flex-col gap-3 border-b border-[var(--shell-border)] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-start">
            <p className="text-sm font-extrabold text-[var(--shell-text)]">
              {t('settingsPage.interface.language')}
            </p>
            <p className="mt-1 text-xs leading-6 text-[var(--shell-text-subtle)]">
              {t('settingsPage.interface.languageHint')}
            </p>
          </div>
          <label className="relative block w-full sm:w-56">
            <span className="sr-only">{t('settingsPage.interface.language')}</span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              className="w-full appearance-none rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 pe-10 text-sm font-semibold text-[var(--shell-text)] outline-none ring-1 ring-[var(--shell-border)] transition focus:ring-2 focus:ring-[var(--shell-accent)]/35"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey, { ns: 'common' })}
                </option>
              ))}
            </select>
            <ChevronLeft
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 -rotate-90 text-[var(--shell-accent)]"
              aria-hidden="true"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 border-b border-[var(--shell-border)] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-start">
            <p className="text-sm font-extrabold text-[var(--shell-text)]">
              {t('settingsPage.interface.theme')}
            </p>
            <p className="mt-1 text-xs leading-6 text-[var(--shell-text-subtle)]">
              {t('settingsPage.interface.themeHint')}
            </p>
          </div>
          <div
            className="inline-flex rounded-xl bg-[var(--shell-input-bg)] p-1"
            role="group"
            aria-label={t('appearance.theme', { ns: 'settings' })}
          >
            <button
              type="button"
              onClick={() => onThemeModeChange(THEME_MODE.LIGHT)}
              aria-pressed={isLight}
              className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${
                isLight
                  ? 'bg-[var(--shell-surface)] text-[var(--shell-accent)] shadow-sm'
                  : 'text-[var(--shell-text-muted)] hover:text-[var(--shell-text)]'
              }`}
            >
              <Sun className="h-4 w-4" strokeWidth={2} />
              <span className="sr-only">{t('appearance.lightMode', { ns: 'settings' })}</span>
            </button>
            <button
              type="button"
              onClick={() => onThemeModeChange(THEME_MODE.DARK)}
              aria-pressed={!isLight}
              className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${
                !isLight
                  ? 'bg-[var(--shell-surface)] text-[var(--shell-accent)] shadow-sm'
                  : 'text-[var(--shell-text-muted)] hover:text-[var(--shell-text)]'
              }`}
            >
              <Moon className="h-4 w-4" strokeWidth={2} />
              <span className="sr-only">{t('appearance.darkMode', { ns: 'settings' })}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-[var(--shell-border)] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-start">
            <p className="text-sm font-extrabold text-[var(--shell-text)]">
              {t('settingsPage.interface.contrast')}
            </p>
            <p className="mt-1 text-xs leading-6 text-[var(--shell-text-subtle)]">
              {t('settingsPage.interface.contrastHint')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={highContrast}
            onClick={() => onHighContrastChange(!highContrast)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--shell-accent)] ${
              highContrast ? 'bg-[var(--shell-accent)]' : 'bg-[var(--shell-border)]'
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-[var(--shell-surface)] shadow transition ${
                highContrast ? 'start-7' : 'start-1'
              }`}
            />
            <span className="sr-only">{t('settingsPage.interface.contrast')}</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-start sm:max-w-xs">
            <p className="text-sm font-extrabold text-[var(--shell-text)]">
              {t('settingsPage.interface.fontSize')}
            </p>
            <p className="mt-1 text-xs leading-6 text-[var(--shell-text-subtle)]">
              {t('settingsPage.interface.fontSizeHint')}
            </p>
          </div>
          <div className="flex w-full items-center gap-3 sm:max-w-md sm:flex-1">
            <span className="text-xs font-bold text-[var(--shell-text-subtle)]" aria-hidden="true">
              A
            </span>
            <label className="flex-1">
              <span className="sr-only">
                {t('settingsPage.interface.fontSizeValue', { percent })}
              </span>
              <input
                type="range"
                min={FONT_SCALE.MIN}
                max={FONT_SCALE.MAX}
                step={FONT_SCALE.STEP}
                value={fontScale}
                onChange={(event) => onFontScaleChange(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--shell-border)] accent-[var(--shell-accent)]"
              />
            </label>
            <span className="text-base font-bold text-[var(--shell-text)]" aria-hidden="true">
              A
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StudentInterfaceSettingsCard
