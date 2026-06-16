function AuthHeroPanel({ image, alt = '', imagePosition = 'center' }) {
  if (!image) return null

  return (
    <aside className="relative h-[320px] w-full shrink-0 overflow-hidden sm:h-[400px] lg:h-[700px] lg:min-h-[700px] lg:w-[576px]">
      <img
        src={image}
        alt={alt}
        className="h-full w-full object-cover"
        style={{ objectPosition: imagePosition }}
      />
    </aside>
  )
}

export default AuthHeroPanel
