function QuestionsLoadErrorBanner({ bankId, error }) {
  if (!error) return null

  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100"
    >
      <p className="text-sm font-bold text-amber-900">تعذّر تحميل أسئلة البنك</p>
      <p className="mt-2 text-sm leading-7 text-amber-800">{error.message}</p>
      {import.meta.env.DEV ? (
        <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs leading-6 text-amber-900">
          <p>
            <span className="font-bold">التشخيص:</span> HTTP {error.status || '—'}
          </p>
          <p className="mt-1 font-mono" dir="ltr">
            GET /question-banks/{bankId}/questions
          </p>
          <p className="mt-2">
            الباكند أرجع 404 رغم أن البنك يظهر في قائمة المجتمع. المطلوب: السماح بقراءة
            الأسئلة لأي مستخدم مسجّل عندما يكون البنك COMMUNITY.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default QuestionsLoadErrorBanner
