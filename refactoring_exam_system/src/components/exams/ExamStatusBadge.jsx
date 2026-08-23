import {
  TEST_FULLY_GRADED_BADGE_STYLE,
  TEST_STATUS_STYLES,
  getExamDisplayStatusLabel,
} from '../../lib/testDisplay'
import { isExamFullyGraded } from '../../lib/testGradingDisplay'

function ExamStatusBadge({ status, test }) {
  const fullyGraded = test ? isExamFullyGraded(test) : false
  const label = test ? getExamDisplayStatusLabel(test) : getExamDisplayStatusLabel({ status })
  const style = fullyGraded
    ? TEST_FULLY_GRADED_BADGE_STYLE
    : TEST_STATUS_STYLES[status] || 'bg-[#F1F5F9] text-[#64748B]'

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>
      {label}
    </span>
  )
}

export default ExamStatusBadge
