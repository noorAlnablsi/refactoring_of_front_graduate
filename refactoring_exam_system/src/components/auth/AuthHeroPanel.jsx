import { useTranslation } from 'react-i18next'
import { usePlatformStats } from '../../hooks/usePlatformStats'
import { formatPlatformCount } from '../../lib/localeNumber'

function AuthHeroPanel({ image, alt = '', imagePosition = 'center', showUsersBadge = true }) {
  const { t } = useTranslation('auth')
  const { usersCount } = usePlatformStats()
  const countLabel = formatPlatformCount(usersCount)

  if (!image) return null

  return (
    <aside className="relative h-[320px] w-full shrink-0 overflow-hidden sm:h-[400px] lg:h-[700px] lg:min-h-[700px] lg:w-[576px]">
      <img
        src={image}
        alt={alt}
        className="h-full w-full object-cover"
        style={{ objectPosition: imagePosition }}
      />

      {showUsersBadge ? (
        <div className="absolute inset-x-4 bottom-5 flex items-center justify-between gap-3 rounded-2xl bg-black/55 px-4 py-3 backdrop-blur-[2px] sm:inset-x-6 sm:bottom-8 sm:px-5">
          <p className="text-sm font-bold leading-6 text-white sm:text-base">
            {countLabel
              ? t('hero.learnersJoined', { count: countLabel })
              : t('hero.learnersJoinedFallback')}
          </p>
          <div className="flex shrink-0 -space-x-2">
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
