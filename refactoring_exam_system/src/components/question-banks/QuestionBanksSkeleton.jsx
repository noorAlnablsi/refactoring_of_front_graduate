function QuestionBanksSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="h-64 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  )
}

export default QuestionBanksSkeleton
