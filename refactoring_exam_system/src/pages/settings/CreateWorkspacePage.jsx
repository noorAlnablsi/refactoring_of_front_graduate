import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import CreateWorkspaceKindToggle from '../../components/settings/CreateWorkspaceKindToggle'
import CreateWorkspaceLogoField from '../../components/settings/CreateWorkspaceLogoField'
import CreateWorkspaceShell from '../../components/settings/CreateWorkspaceShell'
import { WORKSPACE_KIND } from '../../constants/auth'
import { ROUTES } from '../../constants/routes'
import { useCreateWorkspace } from '../../hooks/useCreateWorkspace'
import { useAuthStore } from '../../store/authStore'

const inputClassName =
  'w-full rounded-xl border border-transparent bg-[#EEF2F3] px-4 py-3.5 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#2AA8A2]/30 focus:ring-2 focus:ring-[#2AA8A2]/20'

function CreateWorkspacePage() {
  const { t } = useTranslation('settings')
  const navigate = useNavigate()
  const access_token = useAuthStore((state) => state.access_token)

  const {
    kind,
    name,
    setName,
    description,
    setDescription,
    imagePreview,
    loading,
    error,
    handleKindChange,
    handleImageChange,
    clearImage,
    submit,
  } = useCreateWorkspace()

  const isInstitution = kind === WORKSPACE_KIND.INSTITUTION
  const isSolo = kind === WORKSPACE_KIND.SOLO

  useEffect(() => {
    if (!access_token) {
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { redirectTo: ROUTES.SETTINGS_CREATE_WORKSPACE },
      })
    }
  }, [access_token, navigate])

  if (!access_token) return null

  return (
    <CreateWorkspaceShell>
      <div className="text-right">
        <h1 className="text-2xl font-extrabold text-[#2A3433] md:text-[2rem] md:leading-tight">
          {t('createWorkspace.title')}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#6B7280] md:text-base">
          {t('createWorkspace.subtitle')}
        </p>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#CFECE9] bg-[#EAF7F6] px-4 py-4 text-right">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#2AA8A2] shadow-sm">
          <Info className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <p className="text-sm leading-7 text-[#4B5563]">
          <span className="font-bold text-[#2A3433]">{t('createWorkspace.accountNoticeTitle')}</span>{' '}
          {t('createWorkspace.accountNotice')}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={submit}>
        <div className="space-y-2">
          <span className="block text-sm font-bold text-[#374151]">{t('createWorkspace.kindLabel')}</span>
          <CreateWorkspaceKindToggle selected={kind} onSelect={handleKindChange} />
        </div>

        <CreateWorkspaceLogoField
          preview={imagePreview}
          onChange={handleImageChange}
          onClear={clearImage}
          disabled={loading}
          label={isSolo ? t('createWorkspace.logoSolo') : t('createWorkspace.logoInstitution')}
          uploadLabel={isSolo ? t('createWorkspace.uploadSolo') : t('createWorkspace.uploadInstitution')}
        />

        <label className="block space-y-2 text-right">
          <span className="text-sm font-bold text-[#374151]">
            {isInstitution ? t('createWorkspace.nameInstitution') : t('createWorkspace.nameSolo')}
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={
              isInstitution
                ? t('createWorkspace.nameInstitutionPlaceholder')
                : t('createWorkspace.nameSoloPlaceholder')
            }
            className={inputClassName}
          />
        </label>

        <label className="block space-y-2 text-right">
          <span className="text-sm font-bold text-[#374151]">
            {isInstitution ? t('createWorkspace.descriptionInstitution') : t('createWorkspace.descriptionSolo')}
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={
              isInstitution
                ? t('createWorkspace.descriptionInstitutionPlaceholder')
                : t('createWorkspace.descriptionSoloPlaceholder')
            }
            rows={4}
            className={`${inputClassName} resize-none leading-7`}
          />
        </label>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}

        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70"
          >
            {loading ? t('createWorkspace.submitting') : t('createWorkspace.submit')}
          </button>

          <p className="text-center text-xs leading-6 text-[#9CA3AF]">
            {t('createWorkspace.termsPrefix')}{' '}
            <a href="#" className="font-semibold text-[#2AA8A2] hover:underline">
              {t('createWorkspace.termsOfService')}
            </a>{' '}
            {t('createWorkspace.and')}{' '}
            <a href="#" className="font-semibold text-[#2AA8A2] hover:underline">
              {t('createWorkspace.privacyPolicy')}
            </a>
            .
          </p>
        </div>
      </form>
    </CreateWorkspaceShell>
  )
}

export default CreateWorkspacePage
