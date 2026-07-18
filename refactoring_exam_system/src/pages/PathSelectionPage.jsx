import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthShell from '../components/auth/AuthShell'
import MembershipSelector from '../components/auth/MembershipSelector'
import { ROUTES } from '../constants/routes'
import { resolveMembershipHomeRoute } from '../lib/postLoginNavigation'
import { useAuthStore } from '../store/authStore'
import pathSelectionHero from '../assets/auth/path-selection-hero.png'

function PathSelectionPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const access_token = useAuthStore((s) => s.access_token)
  const memberships = useAuthStore((s) => s.memberships)
  const setSelectedMembership = useAuthStore((s) => s.setSelectedMembership)
  const [selectedId, setSelectedId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!access_token) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    if (memberships.length === 0) {
      navigate(ROUTES.JOIN, { replace: true })
      return
    }

    if (memberships.length === 1) {
      setSelectedMembership(memberships[0].membership_id)
      navigate(resolveMembershipHomeRoute(memberships[0]), { replace: true })
    }
  }, [
    access_token,
    memberships,
    navigate,
    setSelectedMembership,
  ])

  const handleGo = () => {
    if (!selectedId) {
      setError(t('pathSelection.selectError'))
      return
    }

    setSelectedMembership(selectedId)
    const membership = memberships.find((item) => item.membership_id === selectedId)
    navigate(resolveMembershipHomeRoute(membership))
  }

  if (!access_token || memberships.length === 0) return null
  if (memberships.length <= 1) return null

  const hasMultiplePaths = memberships.length > 1

  return (
    <AuthShell
      heroImage={pathSelectionHero}
      heroAlt={t('pathSelection.heroAlt')}
      heroImagePosition="right center"
    >
      <h1 className="text-right text-3xl font-extrabold text-[#2A3433] md:text-4xl">
        {t('pathSelection.title')}
      </h1>
      <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">
        {hasMultiplePaths ? t('pathSelection.multiplePaths') : t('pathSelection.selectPath')}
      </p>

      <div className="mt-8">
        <MembershipSelector
          memberships={memberships}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id)
            setError('')
          }}
        />
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <button
        type="button"
        onClick={handleGo}
        className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 md:w-[448px]"
      >
        {t('pathSelection.go')}
      </button>
    </AuthShell>
  )
}

export default PathSelectionPage
