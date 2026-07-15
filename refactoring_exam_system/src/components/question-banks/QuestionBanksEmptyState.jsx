import { useTranslation } from 'react-i18next'

const EMPTY_TAB_KEYS = {
  my: 'my',
  workspace: 'workspace',
  community: 'community',
}

function QuestionBanksEmptyState({ searching, tab, onCreate }) {
  const { t } = useTranslation('questionBanks')
  const tabKey = EMPTY_TAB_KEYS[tab] || EMPTY_TAB_KEYS.my

  if (searching) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-lg font-bold text-[#2A3433]">{t('empty.noSearchResults')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <p className="text-xl font-bold text-[#2A3433]">{t(`empty.${tabKey}.title`)}</p>
      <p className="mt-3 text-sm text-[#64748B]">{t(`empty.${tabKey}.description`)}</p>
      {tab === 'my' ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white"
        >
          {t('empty.my.createFirst')}
        </button>
      ) : null}
    </div>
  )
}

export default QuestionBanksEmptyState
