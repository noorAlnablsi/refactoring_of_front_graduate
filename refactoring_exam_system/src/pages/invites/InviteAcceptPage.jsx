import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthShell from '../../components/auth/AuthShell'
import { ROUTES } from '../../constants/routes'
import { getInviteRole, getInviteWorkspaceName } from '../../lib/inviteDisplay'
import { acceptInvite, getInvitePreview } from '../../services/invites.service'
import { useAuthStore } from '../../store/authStore'
import loginHero from '../../assets/auth/login-hero.png'

function InviteAcceptPage() {
  const { t } = useTranslation(['invites', 'auth'])
  const navigate = useNavigate()
  const { token } = useParams()
  const access_token = useAuthStore((s) => s.access_token)
  const user = useAuthStore((s) => s.user)
  const appendMembership = useAuthStore((s) => s.appendMembership)

  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!token) {
      navigate(ROUTES.HOME, { replace: true })
      return undefined
    }

    if (!access_token) {
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { redirectTo: `/invites/${token}/accept` },
      })
      return undefined
    }

    let cancelled = false

    async function loadPreview() {
      setLoading(true)
      setError('')

      try {
        const data = await getInvitePreview(token)
        if (!cancelled) setPreview(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPreview()

    return () => {
      cancelled = true
    }
  }, [token, access_token, navigate])

  const invitedEmail = preview?.invited_email?.trim().toLowerCase() || ''
  const loggedInEmail = user?.email?.trim().toLowerCase() || ''
  const emailMismatch = Boolean(invitedEmail && loggedInEmail && invitedEmail !== loggedInEmail)
  const assignedRole = getInviteRole(preview)
  const roleLabel = assignedRole ? t(`roles.${assignedRole}`) : ''

  const handleAccept = async () => {
    if (emailMismatch) {
      setError(t('accept.emailMismatchError'))
      return
    }

    setError('')
    setSuccessMessage('')
    setSubmitting(true)

    try {
      const data = await acceptInvite(token)

      appendMembership({
        membership_id: data.membership_id,
        role: data.role,
        workspace: preview?.workspace || { id: data.workspace_id, kind: 'INSTITUTION' },
        is_owner: false,
      })

      setSuccessMessage(data.message || t('accept.success'))
      navigate(ROUTES.PATH_SELECTION, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!access_token) return null

  return (
    <AuthShell heroImage={loginHero} heroAlt={t('accept.heroAlt')}>
      <h1 className="text-right text-3xl font-extrabold text-[#2A3433] md:text-4xl">{t('accept.title')}</h1>
      <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">{t('accept.subtitle')}</p>

      {loading ? (
        <p className="mt-8 text-sm text-[#64748B]">{t('accept.loading')}</p>
      ) : (
        <div className="mt-8 space-y-3 text-right text-sm text-[#374151]">
          {getInviteWorkspaceName(preview) ? (
            <p>
              {t('preview.institution')}{' '}
              <span className="font-semibold">{getInviteWorkspaceName(preview)}</span>
            </p>
          ) : null}
          {preview?.invited_email ? (
            <p>
              {t('preview.invitedEmail')}{' '}
              <span className="font-semibold">{preview.invited_email}</span>
            </p>
          ) : null}
          {roleLabel ? (
            <p>
              {t('preview.role')} <span className="font-semibold">{roleLabel}</span>
            </p>
          ) : null}
        </div>
      )}

      {emailMismatch ? (
        <p className="mt-4 text-sm text-red-600">
          {t('accept.emailMismatch', { email: user?.email })}
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {successMessage ? (
        <p className="mt-4 rounded-xl bg-[#E8F7F6] px-4 py-3 text-sm font-semibold text-[#2AA8A2]">
          {successMessage}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleAccept}
        disabled={submitting || loading || !preview || emailMismatch}
        className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70 md:w-[448px]"
      >
        {submitting ? t('accept.accepting') : t('accept.accept')}
      </button>

      <p className="mt-5 text-center text-sm text-[#6B7280]">
        <Link to={ROUTES.HOME} className="font-bold text-[#2AA8A2]">
          {t('accept.backHome')}
        </Link>
      </p>
    </AuthShell>
  )
}

export default InviteAcceptPage
