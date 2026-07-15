import { useTranslation } from 'react-i18next'

function QuestionsLoadErrorBanner({ bankId, error }) {
  const { t } = useTranslation('questionBanks')

  if (!error) return null

  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100"
    >
      <p className="text-sm font-bold text-amber-900">{t('editor.loadQuestionsError')}</p>
      <p className="mt-2 text-sm leading-7 text-amber-800">{error.message}</p>
      {import.meta.env.DEV ? (
        <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs leading-6 text-amber-900">
          <p>
            <span className="font-bold">{t('editor.loadQuestionsDiagnostic')}</span> HTTP {error.status || '—'}
          </p>
          <p className="mt-1 font-mono" dir="ltr">
            GET /question-banks/{bankId}/questions
          </p>
          <p className="mt-2">{t('editor.loadQuestionsHint')}</p>
        </div>
      ) : null}
    </div>
  )
}

export default QuestionsLoadErrorBanner
