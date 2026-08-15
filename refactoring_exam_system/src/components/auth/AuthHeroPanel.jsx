import { useTranslation } from 'react-i18next'
import { getLanguageDirection } from '../../lib/language'
import { usePlatformStats } from '../../hooks/usePlatformStats'
import { formatPlatformCount } from '../../lib/localeNumber'
import { useLanguageStore } from '../../store/languageStore'

function AuthHeroPanel({
  image,
  alt = '',
  imagePosition = 'center',
  showUsersBadge = true,
  headline,
}) {
  const { t } = useTranslation('auth')
  const language = useLanguageStore((s) => s.language)
  const dir = getLanguageDirection(language)
  const { usersCount } = usePlatformStats()
  const countLabel = formatPlatformCount(usersCount)
  const title = headline || t('hero.headline')
  const lines = String(title)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (!image) return null

  return (
    <aside className="relative h-[320px] w-full shrink-0 overflow-hidden sm:h-[400px] lg:h-[700px] lg:min-h-[700px] lg:w-[576px]">
      <img
        src={image}
        alt={alt || title.replace(/\n/g, ' ')}
        className="h-full w-full object-cover"
        style={{ objectPosition: imagePosition }}
      />

      <div
        dir={dir}
        className="pointer-events-none absolute top-7 z-10 ps-6 pe-7 sm:top-9 sm:pe-9 lg:top-12 lg:pe-11 start-0"
      >
        <h2 className="auth-hero-headline text-start text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          {lines.map((line) => (
            <span key={line} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </h2>
      </div>

      {showUsersBadge ? (
        <div
          dir={dir}
          className="absolute inset-x-4 bottom-5 z-10 flex items-center justify-between gap-3 rounded-2xl bg-black/55 px-4 py-3 backdrop-blur-[2px] sm:inset-x-6 sm:bottom-8 sm:px-5"
        >
          <p className="text-sm font-bold leading-6 text-white sm:text-base">
            {countLabel
              ? t('hero.learnersJoined', { count: countLabel })
              : t('hero.learnersJoinedFallback')}
          </p>
          <div className="flex shrink-0 -space-x-2 rtl:space-x-reverse">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 bg-[#1F3D5A] text-[11px] font-bold text-white">
              A
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 bg-[#2B857E] text-[11px] font-bold text-white">
              B
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 bg-[#31476D] text-[11px] font-bold text-white">
              C
            </span>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

export default AuthHeroPanel
