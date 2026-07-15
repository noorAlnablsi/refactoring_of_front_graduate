import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DIFFICULTY_OPTIONS,
  getQuestionTypeLabel,
  getTrueFalseChoices,
} from '../../../lib/questionBanks'
import QuestionBodyEditor from './QuestionBodyEditor'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function ChoiceRow({ choice, index, onChange, onRemove, removable, selectable, multiple, placeholder }) {
  return (
    <div className="flex items-center gap-3">
      {selectable ? (
        <input
          type={multiple ? 'checkbox' : 'radio'}
          name="correct_choice"
          checked={choice.is_correct}
          onChange={(event) => onChange(index, 'is_correct', event.target.checked)}
          className="h-4 w-4 accent-[#2AA8A2]"
        />
      ) : null}
      <input
        value={choice.body}
        onChange={(event) => onChange(index, 'body', event.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
      {removable ? (
        <button type="button" onClick={() => onRemove(index)} className="text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}

function QuestionBuilderForm({ value, onChange, onSave, onAddAnother, topics = [] }) {
  const { t } = useTranslation(['questionBanks', 'common'])
  const isEssay = value.type_code === 'ESSAY'
  const isTrueFalse = value.type_code === 'TRUE_FALSE'
  const isMultiple = value.type_code === 'MULTI_SELECT'
  const showChoices = !isEssay

  const setField = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const setChoices = (choices) => onChange({ ...value, choices })

  const handleTypeChange = (typeCode) => {
    let nextChoices = value.choices

    if (typeCode === 'ESSAY') {
      nextChoices = []
    } else if (typeCode === 'TRUE_FALSE') {
      nextChoices = getTrueFalseChoices()
    } else if (!value.choices.length || value.type_code === 'ESSAY' || value.type_code === 'TRUE_FALSE') {
      nextChoices = [
        { body: '', is_correct: true },
        { body: '', is_correct: false },
      ]
    } else if (typeCode === 'MCQ' && value.type_code === 'MULTI_SELECT') {
      let foundFirst = false
      nextChoices = value.choices.map((choice) => {
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

    onChange({ ...value, type_code: typeCode, choices: nextChoices })
  }

  const updateChoice = (index, key, fieldValue) => {
    const nextChoices = value.choices.map((choice, choiceIndex) =>
      choiceIndex === index ? { ...choice, [key]: fieldValue } : { ...choice },
    )

    if (key === 'is_correct' && !isMultiple) {
      nextChoices.forEach((choice, choiceIndex) => {
        choice.is_correct = choiceIndex === index
      })
    }

    setChoices(nextChoices)
  }

  const addChoice = () => {
    setChoices([...value.choices, { body: '', is_correct: false }])
  }

  const removeChoice = (index) => {
    setChoices(value.choices.filter((_, choiceIndex) => choiceIndex !== index))
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[#2A3433]">{t('editor.questionBuilderTitle')}</h2>
        <span className="text-xs font-semibold text-[#94A3B8]">{getQuestionTypeLabel(value.type_code)}</span>
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-semibold text-[#374151]">{t('labels.difficulty')}</label>
        <select
          value={value.difficulty}
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

      <div className="mt-4 space-y-2">
        <label className="text-sm font-semibold text-[#374151]">{t('labels.questionText')}</label>
        <QuestionBodyEditor
          value={value.body}
          typeCode={value.type_code}
          onChange={(body) => setField('body', body)}
          onTypeChange={handleTypeChange}
          topics={topics}
          topicId={value.topic_id}
          onTopicChange={(topicId) => setField('topic_id', topicId)}
        />
        {topics.length === 0 ? (
          <p className="text-xs text-[#C2410C]">{t('editor.noTopicsWarning')}</p>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-semibold text-[#374151]">{t('labels.points')}</label>
        <input
          type="number"
          min="1"
          value={value.points}
          onChange={(event) => setField('points', Number(event.target.value))}
          className={inputClassName}
        />
      </div>

      {showChoices ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm font-semibold text-[#374151]">{t('labels.answers')}</p>
          <div className="space-y-2">
            {value.choices.map((choice, index) => (
              <ChoiceRow
                key={index}
                choice={choice}
                index={index}
                onChange={updateChoice}
                onRemove={removeChoice}
                removable={!isTrueFalse && value.choices.length > 2}
                selectable={true}
                multiple={isMultiple}
                placeholder={t('choices.placeholder', { number: index + 1 })}
              />
            ))}
          </div>
          {!isTrueFalse ? (
            <button
              type="button"
              onClick={addChoice}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2AA8A2]"
            >
              <Plus className="h-4 w-4" />
              {t('choices.addNew')}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#EEF2F3] pt-5">
        <button
          type="button"
          onClick={onSave}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white"
        >
          {t('editor.saveQuestion')}
        </button>
        <button
          type="button"
          onClick={onAddAnother}
          className="rounded-xl bg-[#EEF2F3] px-5 py-3 text-sm font-bold text-[#374151]"
        >
          {t('editor.addAnotherQuestion')}
        </button>
      </div>
    </section>
  )
}

export default QuestionBuilderForm
