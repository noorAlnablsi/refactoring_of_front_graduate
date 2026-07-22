import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DeleteAccountConfirmDialog from '../../components/common/DeleteAccountConfirmDialog'
import StudentInterfaceSettingsCard from '../../components/student/settings/StudentInterfaceSettingsCard'
import StudentPrivacySettingsCard from '../../components/student/settings/StudentPrivacySettingsCard'
import { LANGUAGE } from '../../constants/language'
import { ROUTES } from '../../constants/routes'
import { THEME_MODE } from '../../constants/theme'
import { useDeleteAccount } from '../../hooks/useDeleteAccount'
import { useLogout } from '../../hooks/useLogout'
import { useAccessibilityStore } from '../../store/accessibilityStore'
import { useAuthStore } from '../../store/authStore'
import { useLanguageStore } from '../../store/languageStore'
import { useThemeStore } from '../../store/themeStore'

function StudentSettingsPage() {
  const { t } = useTranslation('student')
  const navigate = useNavigate()
  const userEmail = useAuthStore((s) => s.user?.email || '')
  const { logoutAllSessions, loading: logoutLoading } = useLogout()
  const { deleteAccount, loading: deleteLoading } = useDeleteAccount()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const language = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)
  const themeMode = useThemeStore((s) => s.mode)
  const setThemeMode = useThemeStore((s) => s.setMode)
  const highContrast = useAccessibilityStore((s) => s.highContrast)
  const fontScale = useAccessibilityStore((s) => s.fontScale)
  const setHighContrast = useAccessibilityStore((s) => s.setHighContrast)
  const setFontScale = useAccessibilityStore((s) => s.setFontScale)

  const handleConfirmDelete = async () => {
    try {
      await deleteAccount()
      setDeleteConfirmOpen(false)
    } catch {
      // Toast already shown by hook; keep dialog open so user can retry or cancel.
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-4">
      <header className="text-start">
        <h1 className="text-2xl font-extrabold text-[var(--shell-text)] md:text-3xl">
          {t('settingsPage.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--shell-text-muted)]">
          {t('settingsPage.subtitle')}
        </p>
      </header>

      <StudentInterfaceSettingsCard
        language={language}
        onLanguageChange={(value) =>
          setLanguage(value === LANGUAGE.EN ? LANGUAGE.EN : LANGUAGE.AR)
        }
        themeMode={themeMode}
        onThemeModeChange={(mode) =>
          setThemeMode(mode === THEME_MODE.DARK ? THEME_MODE.DARK : THEME_MODE.LIGHT)
        }
        highContrast={highContrast}
        onHighContrastChange={setHighContrast}
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
      />

      <StudentPrivacySettingsCard
        onChangePasswordClick={() => navigate(ROUTES.STUDENT_SETTINGS_CHANGE_PASSWORD)}
        onLogoutClick={() => void logoutAllSessions()}
        onDeleteClick={() => setDeleteConfirmOpen(true)}
        logoutLoading={logoutLoading}
        deleteLoading={deleteLoading}
      />

      <DeleteAccountConfirmDialog
        open={deleteConfirmOpen}
        expectedEmail={userEmail}
        title={t('settingsPage.privacy.deleteConfirmTitle')}
        message={t('settingsPage.privacy.deleteConfirmMessage')}
        recoveryNote={t('settingsPage.privacy.deleteRecoveryNote')}
        emailLabel={t('settingsPage.privacy.deleteEmailLabel')}
        emailHint={t('settingsPage.privacy.deleteEmailHint')}
        emailMismatch={t('settingsPage.privacy.deleteEmailMismatch')}
        emailPlaceholder={t('settingsPage.privacy.deleteEmailPlaceholder')}
        confirmLabel={t('settingsPage.privacy.deleteConfirmAction')}
        deletingLabel={t('settingsPage.privacy.deleting')}
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) setDeleteConfirmOpen(false)
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  )
}

export default StudentSettingsPage
