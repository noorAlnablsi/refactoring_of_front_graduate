import { useTranslation } from 'react-i18next'
import { isSoloTeacher } from '../../../lib/workspaceContext'

const TAB_IDS = ['overview', 'teachers', 'students', 'banks', 'exams']

function SubjectDetailsTabs({ activeTab, onChange }) {
  const { t } = useTranslation('subjects')
  const visibleTabs = isSoloTeacher() ? TAB_IDS.filter((tabId) => tabId !== 'teachers') : TAB_IDS

  return (
    <div className="border-b border-[#E5E9EB]">
      <div className="flex gap-10 overflow-x-auto">
        {visibleTabs.map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => onChange(tabId)}
            className={`relative shrink-0 pb-4 text-sm font-bold transition ${
              activeTab === tabId ? 'text-[#2AA8A2]' : 'text-[#64748B] hover:text-[#374151]'
            }`}
          >
            {t(`details.tabs.${tabId}`)}
            {activeTab === tabId ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SubjectDetailsTabs
