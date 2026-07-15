import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bold, ChevronDown, Italic, List, Pilcrow, Sigma, Underline } from 'lucide-react'
import { applyParagraphDirection, applyRichTextCommand, getRichTextActiveFormats } from '../../../lib/richText'
import { QUESTION_TYPE_OPTIONS } from '../../../lib/questionBanks'

const toolbarSelectClassName =
  'appearance-none rounded-lg border border-[#2AA8A2]/35 bg-white py-2 pl-3 pr-8 text-sm font-semibold text-[#2AA8A2] outline-none focus:ring-2 focus:ring-[#2AA8A2]/25'

const toolbarButtonClassName =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#64748B] transition hover:bg-[#EEF2F3]'

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-[#E5E9EB]" aria-hidden="true" />
}

function FormatButton({ label, onAction, active = false, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`${toolbarButtonClassName} ${
        active ? 'bg-[#EEF2F3] text-[#2AA8A2] ring-1 ring-[#2AA8A2]/25' : ''
      }`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onAction}
    >
      {children}
    </button>
  )
}

const defaultActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  unorderedList: false,
  paragraphRtl: true,
  paragraphLtr: false,
}

function QuestionBodyEditor({
  value,
  typeCode,
  onChange,
  onTypeChange,
  topics = [],
  topicId = '',
  onTopicChange,
}) {
  const { t } = useTranslation('questionBanks')
  const editorRef = useRef(null)
  const lastSyncedHtml = useRef(value)
  const [activeFormats, setActiveFormats] = useState(defaultActiveFormats)

  const refreshActiveFormats = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    if (!editor.contains(selection.anchorNode)) return

    setActiveFormats(getRichTextActiveFormats(editor))
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    if (value !== lastSyncedHtml.current) {
      editor.innerHTML = value || ''
      lastSyncedHtml.current = value
    }
  }, [value])

  useEffect(() => {
    document.addEventListener('selectionchange', refreshActiveFormats)
    return () => document.removeEventListener('selectionchange', refreshActiveFormats)
  }, [refreshActiveFormats])

  const syncHtml = () => {
    const html = editorRef.current?.innerHTML || ''
    lastSyncedHtml.current = html
    onChange(html)
    refreshActiveFormats()
  }

  const runCommand = (command, commandValue = null) => {
    applyRichTextCommand(editorRef.current, command, commandValue)
    syncHtml()
  }

  const insertSymbol = (symbol) => {
    applyRichTextCommand(editorRef.current, 'insertText', symbol)
    syncHtml()
  }

  const applyDirection = (direction) => {
    applyParagraphDirection(editorRef.current, direction)
    syncHtml()
  }

  return (
    <div className="overflow-hidden rounded-xl bg-[#FAFBFC] ring-1 ring-[#E5E9EB]">
      <div
        dir="ltr"
        className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF2F3] px-3 py-2.5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={typeCode}
              onChange={(event) => onTypeChange(event.target.value)}
              className={toolbarSelectClassName}
              aria-label={t('editor.toolbar.questionTypeAria')}
            >
              {QUESTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2AA8A2]" />
          </div>

          <div className="relative">
            <select
              value={topicId ?? ''}
              onChange={(event) =>
                onTopicChange?.(event.target.value ? Number(event.target.value) : '')
              }
              disabled={topics.length === 0}
              className={`${toolbarSelectClassName} ${
                topics.length === 0 ? 'cursor-not-allowed opacity-80' : ''
              }`}
              aria-label={t('editor.toolbar.topicAria')}
            >
              <option value="">{t('labels.topic')}</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2AA8A2]" />
          </div>
        </div>

        <div className="flex flex-wrap items-center">
          <FormatButton
            label={t('editor.toolbar.underline')}
            active={activeFormats.underline}
            onAction={() => runCommand('underline')}
          >
            <Underline className="h-4 w-4" strokeWidth={2.2} />
          </FormatButton>
          <FormatButton
            label={t('editor.toolbar.bold')}
            active={activeFormats.bold}
            onAction={() => runCommand('bold')}
          >
            <Bold className="h-4 w-4" strokeWidth={2.4} />
          </FormatButton>
          <FormatButton
            label={t('editor.toolbar.italic')}
            active={activeFormats.italic}
            onAction={() => runCommand('italic')}
          >
            <Italic className="h-4 w-4" strokeWidth={2.2} />
          </FormatButton>
          <FormatButton
            label={t('editor.toolbar.bulletList')}
            active={activeFormats.unorderedList}
            onAction={() => runCommand('insertUnorderedList')}
          >
            <List className="h-4 w-4" strokeWidth={2.2} />
          </FormatButton>

          <ToolbarDivider />

          <FormatButton label={t('editor.toolbar.insertMath')} onAction={() => insertSymbol('Σ')}>
            <Sigma className="h-4 w-4" strokeWidth={2.2} />
          </FormatButton>

          <ToolbarDivider />

          <FormatButton
            label={t('editor.toolbar.paragraphRtl')}
            active={activeFormats.paragraphRtl}
            onAction={() => applyDirection('rtl')}
          >
            <span className="flex items-center text-current">
              <Pilcrow className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span className="text-[10px] font-bold leading-none">→</span>
            </span>
          </FormatButton>
          <FormatButton
            label={t('editor.toolbar.paragraphLtr')}
            active={activeFormats.paragraphLtr}
            onAction={() => applyDirection('ltr')}
          >
            <span className="flex items-center text-current">
              <Pilcrow className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span className="text-[10px] font-bold leading-none">←</span>
            </span>
          </FormatButton>
        </div>
      </div>

      <div
        ref={editorRef}
        dir="rtl"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={t('editor.toolbar.questionBodyAria')}
        data-placeholder={t('editor.toolbar.questionBodyPlaceholder')}
        onInput={syncHtml}
        onBlur={syncHtml}
        onKeyUp={refreshActiveFormats}
        onMouseUp={refreshActiveFormats}
        onFocus={refreshActiveFormats}
        className="min-h-[140px] px-4 py-4 text-sm leading-7 text-[#374151] outline-none empty:before:text-[#94A3B8] empty:before:content-[attr(data-placeholder)] focus:ring-2 focus:ring-inset focus:ring-[#2AA8A2]/20 [&_ol]:list-decimal [&_ol]:pr-5 [&_ul]:list-disc [&_ul]:pr-5"
      />
    </div>
  )
}

export default QuestionBodyEditor
