import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, LayoutGrid, UserPlus } from 'lucide-react'
import SendInviteModal from '../components/invites/SendInviteModal'
import { ROUTES } from '../constants/routes'
import {
  shellBodyTextClass,
  shellCardInteractiveClass,
  shellIconWrapClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
  shellSectionTitleClass,
} from '../lib/shellUi'
import { canAccessSubjectsModule, canSendInvites, getActiveMembership } from '../lib/workspaceContext'
import { useAuthStore } from '../store/authStore'

function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const showSubjectsCard = canAccessSubjectsModule()
  const showInviteCard = canSendInvites()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const fullName = user?.full_name?.trim() || 'مستخدم'
  const workspaceName = membership?.workspace?.name?.trim()
  const greeting =
    workspaceName && workspaceName !== fullName
      ? `مرحباً ${fullName} — ${workspaceName}`
      : `مرحباً ${fullName}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl md:text-3xl ${shellPageTitleClass}`}>لوحة التحكم</h1>
        <p className={`mt-2 ${shellPageSubtitleClass}`}>{greeting}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {showSubjectsCard ? (
          <Link to={ROUTES.SUBJECTS} className={`flex items-center gap-4 p-6 ${shellCardInteractiveClass}`}>
            <span className={`h-12 w-12 ${shellIconWrapClass}`}>
              <BookOpen className="h-6 w-6" />
            </span>
            <div>
              <p className={shellSectionTitleClass}>إدارة المواد</p>
              <p className={shellBodyTextClass}>إنشاء وإدارة المواد الدراسية</p>
            </div>
          </Link>
        ) : null}

        {showInviteCard ? (
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className={`flex items-center gap-4 p-6 text-right ${shellCardInteractiveClass}`}
          >
            <span className={`h-12 w-12 ${shellIconWrapClass}`}>
              <UserPlus className="h-6 w-6" />
            </span>
            <div>
              <p className={shellSectionTitleClass}>إرسال دعوة</p>
              <p className={shellBodyTextClass}>دعوة طالب أو معلم أو مدير عبر البريد</p>
            </div>
          </button>
        ) : null}

        <div className={`flex items-center gap-4 p-6 opacity-60 ${shellCardInteractiveClass}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--shell-hover)] text-[var(--shell-text-muted)]">
            <LayoutGrid className="h-6 w-6" />
          </span>
          <div>
            <p className={shellSectionTitleClass}>وحدات أخرى</p>
            <p className={shellBodyTextClass}>قريباً</p>
          </div>
        </div>
      </div>

      <SendInviteModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </div>
  )
}

export default DashboardPage
