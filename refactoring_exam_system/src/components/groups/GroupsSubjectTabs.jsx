function GroupsSubjectTabs({ subjects, selectedSubjectId, onChange }) {
  if (!subjects?.length) return null

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-end gap-12 border-b border-[#E8EEF0] md:gap-14">
        {subjects.map((subject) => {
          const active = String(selectedSubjectId) === String(subject.id)
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => onChange(String(subject.id))}
              className={`relative shrink-0 pb-3 text-[15px] font-bold leading-6 transition ${
                active
                  ? 'text-[#2AA8A2]'
                  : 'text-[#475569] hover:text-[#2A3433]'
              }`}
            >
              {subject.name}
              {active ? (
                <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[#2AA8A2]" />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default GroupsSubjectTabs
