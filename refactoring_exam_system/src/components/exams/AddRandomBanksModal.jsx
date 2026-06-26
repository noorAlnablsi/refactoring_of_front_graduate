import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { DIFFICULTY_OPTIONS } from '../../lib/questionBanks'
import { getMyQuestionBanks } from '../../services/questionBanks.service'
import { addRandomQuestionsFromBanks } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2AA8A2]/40'

function AddRandomBanksModal({ open, testId, onClose, onSuccess }) {
  const showToast = useToastStore((s) => s.showToast)
  const [banks, setBanks] = useState([])
  const [selectedBankIds, setSelectedBankIds] = useState([])
  const [counts, setCounts] = useState({ EASY: 0, MEDIUM: 0, HARD: 0 })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    getMyQuestionBanks()
      .then((data) => setBanks((data.question_banks || []).filter((b) => !b.is_archived)))
      .catch((err) => showToast(err.message, 'error'))
  }, [open, showToast])

  const toggleBank = (id) => {
    setSelectedBankIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const totalCount = Object.values(counts).reduce((sum, n) => sum + (Number(n) || 0), 0)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedBankIds.length || totalCount < 1) {
      showToast('اختر بنكاً واحداً على الأقل وحدد عدد الأسئلة', 'error')
      return
    }
    setSubmitting(true)
    try {
      await addRandomQuestionsFromBanks(testId, {
        bank_ids: selectedBankIds.map(Number),
        counts_by_difficulty: {
          EASY: Number(counts.EASY) || 0,
          MEDIUM: Number(counts.MEDIUM) || 0,
          HARD: Number(counts.HARD) || 0,
        },
      })
      showToast(`تمت إضافة ${totalCount} سؤال عشوائي`)
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
          <h2 className="text-xl font-extrabold text-[#2A3433]">إضافة عشوائية من البنوك</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[#64748B]">اختر بنكاً أو أكثر وحدد عدد الأسئلة لكل مستوى صعوبة.</p>

        <div>
          <p className="mb-2 text-sm font-bold text-[#374151]">البنوك</p>
          <ul className="max-h-40 space-y-2 overflow-y-auto">
            {banks.map((bank) => (
              <li key={bank.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#F6F8F9] px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedBankIds.includes(bank.id)}
                    onChange={() => toggleBank(bank.id)}
                    className="accent-[#2AA8A2]"
                  />
                  <span className="text-sm text-[#64748B]">
                    {bank.title} {bank.subject_name ? `(${bank.subject_name})` : ''}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {DIFFICULTY_OPTIONS.map(({ value, label }) => (
            <div key={value}>
              <label className="mb-1 block text-xs font-bold text-[#64748B]">{label}</label>
              <input
                type="number"
                min={0}
                value={counts[value]}
                onChange={(e) => setCounts((prev) => ({ ...prev, [value]: e.target.value }))}
                className={inputClassName}
              />
            </div>
          ))}
        </div>

        <p className="text-sm font-bold text-[#2AA8A2]">المجموع: {totalCount} سؤال</p>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-bold text-[#64748B]">
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitting || totalCount < 1}
            className="rounded-xl bg-[#2AA8A2] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? 'جاري الإضافة...' : 'إضافة الأسئلة'}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

export default AddRandomBanksModal
