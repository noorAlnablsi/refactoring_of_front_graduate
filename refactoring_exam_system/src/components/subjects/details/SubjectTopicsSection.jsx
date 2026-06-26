import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import CreateTopicModal from '../topics/CreateTopicModal'
import EditTopicModal from '../topics/EditTopicModal'
import { canManageSubjectTopics } from '../../../lib/workspaceContext'
import { deleteSubjectTopic } from '../../../services/subjects.service'
import { useToastStore } from '../../../store/toastStore'

function SubjectTopicsSection({ subjectId, topics, onRefresh }) {
  const showToast = useToastStore((s) => s.showToast)
  const canManage = canManageSubjectTopics()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTopic, setEditTopic] = useState(null)

  const openCreate = () => setCreateOpen(true)

  const addTopicButtonClassName =
    'inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_16px_rgba(42,168,162,0.2)] transition hover:opacity-95'

  const addTopicInlineButtonClassName =
    'inline-flex items-center gap-1.5 rounded-lg bg-[#2AA8A2] px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(42,168,162,0.14)] transition hover:bg-[#259690]'

  const handleDelete = async (topic) => {
    if (!window.confirm(`حذف المحور "${topic.name}"؟`)) return
    try {
      await deleteSubjectTopic(subjectId, topic.id)
      showToast('تم حذف المحور')
      onRefresh?.()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <>
      <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <div className="mb-5">
          {topics.length > 0 ? (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#2A3433]">محاور المادة</h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  حدّد المحاور التعليمية للمادة — تُستخدم لاحقاً عند إضافة أسئلة في بنوك الأسئلة.
                </p>
              </div>
              {canManage ? (
                <button type="button" onClick={openCreate} className={`shrink-0 ${addTopicInlineButtonClassName}`}>
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                  إضافة محور
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-[#2A3433]">محاور المادة</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                حدّد المحاور التعليمية للمادة — تُستخدم لاحقاً عند إضافة أسئلة في بنوك الأسئلة.
              </p>
            </>
          )}
        </div>

        {topics.length === 0 ? (
          <div className="rounded-2xl bg-[#F8FAFB] px-4 py-10 text-center">
            <p className="text-sm font-semibold text-[#64748B]">لا توجد محاور لهذه المادة بعد.</p>
            {canManage ? (
              <>
                <p className="mt-2 text-xs text-[#94A3B8]">
                  أضف محاوراً لتنظيم المحتوى وتصنيف الأسئلة.
                </p>
                <button type="button" onClick={openCreate} className={`mt-5 ${addTopicButtonClassName}`}>
                  <Plus className="h-4 w-4" />
                  إضافة أول محور
                </button>
              </>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-start justify-between gap-4 rounded-2xl bg-[#F8FAFB] px-4 py-4 ring-1 ring-[#EEF2F3]"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[#2A3433]">{topic.name}</p>
                  {topic.description ? (
                    <p className="mt-1 text-sm leading-6 text-[#64748B]">{topic.description}</p>
                  ) : null}
                </div>
                {canManage ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditTopic(topic)}
                      className="rounded-lg p-2 text-[#64748B] hover:bg-white hover:text-[#2AA8A2]"
                      aria-label="تعديل المحور"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(topic)}
                      className="rounded-lg p-2 text-red-600 hover:bg-white"
                      aria-label="حذف المحور"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <CreateTopicModal
        open={createOpen}
        subjectId={subjectId}
        onClose={() => setCreateOpen(false)}
        onSuccess={onRefresh}
      />

      <EditTopicModal
        open={Boolean(editTopic)}
        subjectId={subjectId}
        topic={editTopic}
        onClose={() => setEditTopic(null)}
        onSuccess={onRefresh}
      />
    </>
  )
}

export default SubjectTopicsSection
