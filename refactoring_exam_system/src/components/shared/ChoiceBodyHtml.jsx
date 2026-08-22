import { getChoiceBodyHtml } from '../../lib/questionDisplay'

function ChoiceBodyHtml({ choice, className = '' }) {
  const html = getChoiceBodyHtml(choice)
  if (!html) return null

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default ChoiceBodyHtml
