import {
  communityQuestionBankCardClassName,
  ownedQuestionBankCardClassName,
} from '../../lib/questionBanks'

function QuestionBanksSkeleton({ ownedStyle = true }) {
  if (ownedStyle) {
    return (
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`animate-pulse rounded-xl bg-white ${ownedQuestionBankCardClassName}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-9 w-9 animate-pulse rounded-lg bg-white" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`animate-pulse rounded-xl bg-white ${communityQuestionBankCardClassName}`}
          />
        ))}
      </div>
    </div>
  )
}

export default QuestionBanksSkeleton
