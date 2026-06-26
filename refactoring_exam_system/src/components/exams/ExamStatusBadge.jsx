import { TEST_STATUS_STYLES, getTestStatusLabel } from '../../lib/testDisplay'

function ExamStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${TEST_STATUS_STYLES[status] || 'bg-[#F1F5F9] text-[#64748B]'}`}
    >
      {getTestStatusLabel(status)}
    </span>
  )
}

export default ExamStatusBadge
