function StudentPlaceholderPage({ title, description }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <h1 className="text-2xl font-extrabold text-[#2A3433]">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-[#64748B]">{description}</p>
      <p className="mt-4 text-xs font-semibold text-[#94A3B8]">قريباً — جاهز للربط مع الباك اند</p>
    </div>
  )
}

export default StudentPlaceholderPage
