import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, X } from 'lucide-react'
import {
  DIFFICULTY_OPTIONS,
  getQuestionTypeLabel,
  getTrueFalseChoices,
} from '../../lib/questionBanks'
import { hasQuestionStem } from '../../lib/questionImage'
import { isRichTextEmpty } from '../../lib/richText'
import {
  buildTestQuestionPatchPayload,
  normalizeTestQuestionForForm,
  validateTestQuestionForm,
} from '../../lib/testQuestionEdit'
import { customModalOverlayClass, customModalPanelSafeClass } from '../../lib/shellUi'
import QuestionBodyEditor from '../question-banks/editor/QuestionBodyEditor'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function EditTestQuestionModal({
  open,
  question,
  topics = [],
  submitting = false,
  surveyMode = false,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation(['exams', 'questionBanks', 'common'])
  const [form, setForm] = useState(() => normalizeTestQuestionForForm(question))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !question) return
    setForm(normalizeTestQuestionForForm(question))
    setError('')
  }, [open, question])

  if (!open || !question) return null

  const isEssay = form.type_code === 'ESSAY'
  const isTrueFalse = form.type_code === 'TRUE_FALSE'
  const isMultiple = form.type_code === 'MULTI_SELECT'

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const setChoices = (choices) => setForm((prev) => ({ ...prev, choices }))

  const handleTypeChange = (typeCode) => {
    let nextChoices = form.choices

    if (typeCode === 'ESSAY') {
      nextChoices = []
    } else if (typeCode === 'TRUE_FALSE') {
      nextChoices = getTrueFalseChoices()
    } else if (!form.choices.length || form.type_code === 'ESSAY' || form.type_code === 'TRUE_FALSE') {
      nextChoices = [
        { body: '', is_correct: true },
        { body: '', is_correct: false },
      ]
    } else if (typeCode === 'MCQ' && form.type_code === 'MULTI_SELECT') {
      let foundFirst = false
      nextChoices = form.choices.map((choice) => {
        if (choice.is_correct && !foundFirst) {
          foundFirst = true
          return { ...choice }
        }
        return { ...choice, is_correct: false }
      })
      if (!foundFirst && nextChoices.length) {
        nextChoices[0] = { ...nextChoices[0], is_correct: true }
      }
    }

    setForm((prev) => ({ ...prev, type_code: typeCode, choices: nextChoices }))
  }

  const updateChoice = (index, key, value) => {
    const nextChoices = form.choices.map((choice, choiceIndex) =>
      choiceIndex === index ? { ...choice, [key]: value } : { ...choice },
    )

    if (key === 'is_correct' && !isMultiple) {
      nextChoices.forEach((choice, choiceIndex) => {
        choice.is_correct = choiceIndex === index
      })
    }

    setChoices(nextChoices)
  }

  const addChoice = () => {
    setChoices([...form.choices, { body: '', is_correct: false }])
  }

  const removeChoice = (index) => {
    setChoices(form.choices.filter((_, choiceIndex) => choiceIndex !== index))
  }

  const validate = () => {
    const key = validateTestQuestionForm(form, { surveyMode })
    if (key) {
      if (key.startsWith('validation.')) {
        return t(key, { ns: 'questionBanks', defaultValue: t(key, { ns: 'exams' }) })
      }
      return key
    }
    if (!hasQuestionStem(form)) {
      return t('validation.questionContentRequired', { ns: 'questionBanks' })
    }
    if (topics.length > 0 && !form.topic_id) {
      return t('validation.topicRequired', { ns: 'questionBanks' })
    }
    return ''
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    await onSubmit?.(buildTestQuestionPatchPayload(form, question, { surveyMode }))
  }

  return (
    <div className={customModalOverlayClass}>
      <div dir="rtl" className={`w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl ${customModalPanelSafeClass}`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#2A3433]">
            {t('wizard.questions.review.editQuestionTitle')}
          </h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-xs font-semibold text-[#94A3B8]">{getQuestionTypeLabel(form.type_code)}</div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">
              {t('labels.difficulty', { ns: 'questionBanks' })}
            </label>
            <select
              value={form.difficulty}
              onChange={(event) => setField('difficulty', event.target.value)}
              className={inputClassName}
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">
              {t('labels.questionText', { ns: 'questionBanks' })}
            </label>
            <QuestionBodyEditor
              value={form.body}
              typeCode={form.type_code}
              onChange={(body) => setField('body', body)}
              onTypeChange={handleTypeChange}
              topics={topics}
              topicId={form.topic_id}
              onTopicChange={(topicId) => setField('topic_id', topicId)}
              imagePath={form.image_path}
              imageUrl={form.image_url}
              onImageChange={({ image_path, image_url }) =>
                setForm((prev) => ({ ...prev, image_path, image_url }))
              }
            />
            {isRichTextEmpty(form.body) && (form.image_path || form.image_url) ? (
              <p className="text-xs font-semibold text-[#94A3B8]">
                {t('wizard.questions.review.imageOnlyHint')}
              </p>
            ) : null}
          </div>

          {!surveyMode ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#374151]">
                {t('labels.points', { ns: 'questionBanks' })}
              </label>
              <input
                type="number"
                min="1"
                value={form.points}
                onChange={(event) => setField('points', Number(event.target.value))}
                className={inputClassName}
              />
            </div>
          ) : null}

          {!isEssay ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#374151]">
                {t('labels.answers', { ns: 'questionBanks' })}
              </p>
              {form.choices.map((choice, index) => (
                <div key={choice.id || index} className="flex items-center gap-3">
                  <input
                    type={isMultiple ? 'checkbox' : 'radio'}
                    name="test_edit_correct_choice"
                    checked={choice.is_correct}
                    onChange={(event) => updateChoice(index, 'is_correct', event.target.checked)}
                    className="h-4 w-4 accent-[#2AA8A2]"
                  />
                  <input
                    value={choice.body}
                    onChange={(event) => updateChoice(index, 'body', event.target.value)}
                    placeholder={t('choices.placeholder', { ns: 'questionBanks', number: index + 1 })}
                    className={inputClassName}
                  />
                  {!isTrueFalse && form.choices.length > 2 ? (
                    <button type="button" onClick={() => removeChoice(index)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              {!isTrueFalse ? (
                <button
                  type="button"
                  onClick={addChoice}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#2AA8A2]"
                >
                  <Plus className="h-4 w-4" />
                  {t('choices.addNew', { ns: 'questionBanks' })}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#EEF2F3] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#EEF2F3] px-5 py-2.5 text-sm font-bold text-[#374151]"
          >
            {t('actions.cancel', { ns: 'common' })}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-[#2AA8A2] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting
              ? t('wizard.questions.review.savingEdit')
              : t('wizard.questions.review.saveEdit')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditTestQuestionModal
