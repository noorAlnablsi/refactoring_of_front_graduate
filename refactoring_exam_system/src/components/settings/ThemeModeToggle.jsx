import { Moon, Sun } from 'lucide-react'
import { THEME_MODE } from '../../constants/theme'
import { useThemeStore } from '../../store/themeStore'

function ThemeModeToggle() {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)

  const isLight = mode === THEME_MODE.LIGHT

  return (
    <div
      className="inline-flex rounded-xl bg-[var(--shell-input-bg)] p-1"
      role="group"
      aria-label="النمط"
    >
      <button
        type="button"
        onClick={() => setMode(THEME_MODE.LIGHT)}
        aria-pressed={isLight}
        className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${
          isLight
            ? 'bg-[var(--shell-surface)] text-[var(--shell-accent)] shadow-sm'
            : 'text-[var(--shell-text-muted)] hover:text-[var(--shell-text)]'
        }`}
      >
        <Sun className="h-4 w-4" strokeWidth={2} />
        <span className="sr-only">الوضع الفاتح</span>
      </button>
      <button
        type="button"
        onClick={() => setMode(THEME_MODE.DARK)}
        aria-pressed={!isLight}
        className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${
          !isLight
            ? 'bg-[var(--shell-surface)] text-[var(--shell-accent)] shadow-sm'
            : 'text-[var(--shell-text-muted)] hover:text-[var(--shell-text)]'
        }`}
      >
        <Moon className="h-4 w-4" strokeWidth={2} />
        <span className="sr-only">الوضع الداكن</span>
      </button>
    </div>
  )
}

export default ThemeModeToggle
