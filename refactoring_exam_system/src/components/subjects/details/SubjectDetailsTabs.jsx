const tabs = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'teachers', label: 'المعلمون' },
  { id: 'banks', label: 'بنوك الأسئلة' },
  { id: 'exams', label: 'الاختبارات' },
]

function SubjectDetailsTabs({ activeTab, onChange }) {
  return (
    <div className="border-b border-[#E5E9EB]">
      <div className="flex gap-10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative shrink-0 pb-4 text-sm font-bold transition ${
              activeTab === tab.id ? 'text-[#2AA8A2]' : 'text-[#64748B] hover:text-[#374151]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SubjectDetailsTabs
