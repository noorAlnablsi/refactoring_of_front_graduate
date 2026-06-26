import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { getMyQuestionBanks, getQuestionBankQuestions } from '../../services/questionBanks.service'
import { addQuestionsFromBank } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2AA8A2]/40'

function AddFromBankModal({ open, testId, onClose, onSuccess }) {
  const showToast = useToastStore((s) => s.showToast)
  const [banks, setBanks] = useState([])
  const [bankId, setBankId] = useState('')
  const [questions, setQuestions] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loadingBanks, setLoadingBanks] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoadingBanks(true)
    getMyQuestionBanks()
      .then((data) => setBanks((data.question_banks || []).filter((b) => !b.is_archived)))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoadingBanks(false))
  }, [open, showToast])

  useEffect(() => {
    if (!bankId) {
      setQuestions([])
      setSelectedIds([])
      return
    }
    setLoadingQuestions(true)
    getQuestionBankQuestions(bankId)
      .then((data) => {
        setQuestions(data.questions || [])
        setSelectedIds([])
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoadingQuestions(false))
  }, [bankId, showToast])

  const toggleQuestion = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(questions.map((q) => q.id))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!bankId || selectedIds.length === 0) {
      showToast('اختر بنكاً وأسئلة على الأقل', 'error')
      return
    }
    setSubmitting(true)
    try {
      await addQuestionsFromBank(testId, {
        bank_id: Number(bankId),
        question_ids: selectedIds,
      })
      showToast(`تمت إضافة ${selectedIds.length} سؤال`)
      onSuccess?.()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div dir="rtl" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#2A3433]">إضافة من بنك الأسئلة</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[#64748B]">اختر بنكاً واحداً ثم حدد الأسئلة المطلوبة.</p>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">بنك الأسئلة</label>
          <select
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
            className={inputClassName}
            disabled={loadingBanks}
          >
            <option value="">— اختر البنك —</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.title} {bank.subject_name ? `(${bank.subject_name})` : ''}
              </option>
            ))}
          </select>
        </div>

        {bankId ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-[#374151]">الأسئلة</p>
              {questions.length > 0 ? (
                <button type="button" onClick={toggleAll} className="text-xs font-bold text-[#2AA8A2]">
                  {selectedIds.length === questions.length ? 'إلغاء الكل' : 'تحديد الكل'}
                </button>
              ) : null}
            </div>
            {loadingQuestions ? (
              <p className="text-sm text-[#94A3B8]">جاري التحميل...</p>
            ) : questions.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">لا توجد أسئلة في هذا البنك.</p>
            ) : (
              <ul className="max-h-60 space-y-2 overflow-y-auto">
                {questions.map((question) => (
                  <li key={question.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#F6F8F9] p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(question.id)}
                        onChange={() => toggleQuestion(question.id)}
                        className="mt-1 accent-[#2AA8A2]"
                      />
                      <span
                        className="line-clamp-2 text-sm text-[#64748B]"
                        dangerouslySetInnerHTML={{ __html: question.body || '' }}
                      />
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-bold text-[#64748B]">
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedIds.length}
            className="rounded-xl bg-[#2AA8A2] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? 'جاري الإضافة...' : `إضافة (${selectedIds.length})`}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

export default AddFromBankModal
