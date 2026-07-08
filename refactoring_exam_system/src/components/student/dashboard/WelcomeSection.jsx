function WelcomeSection({ name }) {
  const displayName = name?.trim() || 'طالب'

  return (
    <header className="text-right">
      <h1 className="text-2xl font-extrabold text-[#2A3433] md:text-[28px]">
        مرحباً، {displayName} 👋
      </h1>
      <p className="mt-2 text-sm text-[#64748B] md:text-base">
        نتمنى لك يوماً موفقاً في اختباراتك.
      </p>
    </header>
  )
}

export default WelcomeSection
