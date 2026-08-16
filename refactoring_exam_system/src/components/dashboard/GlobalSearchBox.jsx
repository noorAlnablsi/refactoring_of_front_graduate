import { Loader2, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { resolveGlobalSearchPath } from '../../lib/globalSearch'
import { getLanguageDirection } from '../../lib/language'
import {
  shellBodyTextClass,
  shellCardClass,
  shellDividerClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'
import { useLanguageStore } from '../../store/languageStore'

function GlobalSearchBox({ placeholder, className = '' }) {
  const { t } = useTranslation('navigation')
  const navigate = useNavigate()
  const language = useLanguageStore((s) => s.language)
  const dir = getLanguageDirection(language)
  const {
    rootRef,
    query,
    setQuery,
    open,
    setOpen,
    loading,
    error,
    sections,
    totalHits,
    hasQuery,
    clear,
  } = useGlobalSearch()

  const showPanel = open && (hasQuery || loading || error)

  const handleSelect = (hit) => {
    const path = resolveGlobalSearchPath(hit)
    if (!path) return
    clear()
    navigate(path)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]"
        strokeWidth={2}
      />
      <input
        type="search"
        value={query}
        dir={dir}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value)
          if (event.target.value.trim()) setOpen(true)
        }}
        onFocus={() => {
          if (hasQuery || loading || error) setOpen(true)
        }}
        aria-label={placeholder}
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        className="h-9 w-full rounded-full border-0 bg-[var(--shell-search-bg)] pt-[3px] pe-10 ps-4 pb-1 text-sm text-[var(--shell-text)] outline-none placeholder:text-sm placeholder:text-[var(--shell-text-subtle)] focus:ring-2 focus:ring-[var(--shell-accent)]/25"
      />

      {showPanel ? (
        <div
          id="global-search-results"
          role="listbox"
          className={`absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 max-h-[min(70vh,420px)] overflow-y-auto p-3 ${shellCardClass}`}
        >
          {loading ? (
            <div className={`flex items-center gap-2 px-2 py-3 ${shellSubtleTextClass}`}>
              <Loader2 className="h-4 w-4 animate-spin text-[var(--shell-accent)]" />
              {t('globalSearch.loading')}
            </div>
          ) : null}

          {!loading && error ? (
            <p className="px-2 py-3 text-sm text-red-500">{error}</p>
          ) : null}

          {!loading && !error && hasQuery && totalHits === 0 ? (
            <p className={`px-2 py-3 ${shellBodyTextClass}`}>{t('globalSearch.empty')}</p>
          ) : null}

          {!loading && !error
            ? sections.map((section, sectionIndex) => (
                <section key={section.key} className="mb-3 last:mb-0">
                  <h3 className={`px-2 pb-1 text-xs font-bold uppercase tracking-wide ${shellSubtleTextClass}`}>
                    {t(`globalSearch.sections.${section.key}`)}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((hit) => {
                      const path = resolveGlobalSearchPath(hit)
                      const disabled = !path
                      return (
                        <li key={`${hit.type}-${hit.id}-${hit.route?.name || 'x'}`}>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => handleSelect(hit)}
                            className={`flex w-full flex-col rounded-xl px-3 py-2 text-start transition ${
                              disabled
                                ? 'cursor-default opacity-60'
                                : 'hover:bg-[var(--shell-hover)]'
                            }`}
                          >
                            <span className={`truncate text-sm ${shellPageTitleClass}`}>
                              {hit.title || t('globalSearch.untitled')}
                            </span>
                            {hit.subtitle ? (
                              <span className={`mt-0.5 truncate text-xs ${shellSubtleTextClass}`}>
                                {hit.subtitle}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                  {sectionIndex < sections.length - 1 ? (
                    <div className={`mt-3 border-t ${shellDividerClass}`} />
                  ) : null}
                </section>
              ))
            : null}
        </div>
      ) : null}
    </div>
  )
}

export default GlobalSearchBox
