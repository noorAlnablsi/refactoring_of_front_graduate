import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import { INVITE_STATUS_MESSAGES } from '../../constants/invites'
import { ROUTES } from '../../constants/routes'
import {
  getInviteRole,
  getInviteWorkspaceName,
  isInviteActionable,
} from '../../lib/inviteDisplay'
import { getInvitePreview, rejectInvite } from '../../services/invites.service'
import loginHero from '../../assets/auth/login-hero.png'

function InvitePreviewPage() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rejecting, setRejecting] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const loadPreview = async () => {
    setLoading(true)
    setError('')
    setInfoMessage('')

    try {
      const data = await getInvitePreview(token)
      setPreview(data)

      const statusMessage = INVITE_STATUS_MESSAGES[data.status]
      if (statusMessage) setInfoMessage(statusMessage)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate(ROUTES.HOME, { replace: true })
      return undefined
    }

    loadPreview()
  }, [token, navigate])

  const handleReject = async () => {
    setError('')
    setRejecting(true)

    try {
      const result = await rejectInvite(token)
      setInfoMessage(result.message || 'تم رفض الدعوة')
      await loadPreview()
    } catch (err) {
      setError(err.message)
    } finally {
      setRejecting(false)
    }
  }

  const registerPath = `/invites/${token}/register`
  const acceptPath = `/invites/${token}/accept`
  const actionable = isInviteActionable(preview)
  const workspaceName = getInviteWorkspaceName(preview)
  const assignedRole = getInviteRole(preview)

  return (
    <AuthShell heroImage={loginHero} heroAlt="دعوة للانضمام">
      <h1 className="text-right text-3xl font-extrabold text-[#2A3433] md:text-4xl">دعوة للانضمام</h1>
      <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">
        تمت دعوتك للانضمام إلى مساحة تعليمية على QuizHub.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-[#64748B]">جاري تحميل بيانات الدعوة...</p>
      ) : (
        <div className="mt-8 space-y-3 text-right text-sm text-[#374151]">
          {workspaceName ? (
            <p>
              المؤسسة: <span className="font-semibold">{workspaceName}</span>
            </p>
          ) : null}
          {preview?.invited_email ? (
            <p>
              البريد المدعو: <span className="font-semibold">{preview.invited_email}</span>
            </p>
          ) : null}
          {assignedRole ? (
            <p>
              الدور: <span className="font-semibold">{assignedRole}</span>
            </p>
          ) : null}
          {preview?.expires_at ? (
            <p className="text-[#64748B]">تنتهي صلاحية الدعوة: {preview.expires_at}</p>
          ) : null}
        </div>
      )}

      {infoMessage ? (
        <p className="mt-4 rounded-xl bg-[#E8F7F6] px-4 py-3 text-sm font-semibold text-[#2AA8A2]">
          {infoMessage}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {actionable ? (
        <div className="mt-8 flex flex-col gap-3 md:w-[448px]">
          <button
            type="button"
            disabled={loading || !preview}
            onClick={() => navigate(registerPath)}
            className="h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70"
          >
            إنشاء حساب جديد
          </button>

          <button
            type="button"
            disabled={loading || !preview}
            onClick={() => navigate(acceptPath)}
            className="h-12 w-full rounded-xl border border-[#2AA8A2] bg-white text-base font-bold text-[#2AA8A2] transition hover:bg-[#E8F7F6] disabled:opacity-70"
          >
            لدي حساب — قبول الدعوة
          </button>

          <button
            type="button"
            disabled={loading || rejecting || !preview}
            onClick={handleReject}
            className="h-12 w-full rounded-xl border border-[#E5E9EB] bg-white text-base font-bold text-[#64748B] transition hover:bg-[#F6F8F9] disabled:opacity-70"
          >
            {rejecting ? 'جاري الرفض...' : 'رفض الدعوة'}
          </button>
        </div>
      ) : null}

      <p className="mt-5 text-center text-sm text-[#6B7280]">
        <Link to={ROUTES.HOME} className="font-bold text-[#2AA8A2]">
          العودة للرئيسية
        </Link>
      </p>
    </AuthShell>
  )
}

export default InvitePreviewPage
