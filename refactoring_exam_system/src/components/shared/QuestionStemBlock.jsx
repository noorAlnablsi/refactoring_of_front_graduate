import {
  getQuestionImageSrc,
  shouldShowQuestionStemHtml,
  getQuestionStemHtml,
} from '../../lib/questionDisplay'

function QuestionStemBlock({
  question,
  textClassName = 'text-sm font-bold leading-7 text-[#2A3433]',
  imageClassName = 'mt-4 max-h-64 w-full rounded-xl object-contain',
  imageWrapClassName = 'mt-4 overflow-hidden rounded-xl bg-[#F8FAFB] ring-1 ring-[#E5E9EB]',
}) {
  const showText = shouldShowQuestionStemHtml(question)
  const imageSrc = getQuestionImageSrc(question)

  return (
    <>
      {showText ? (
        <div
          className={textClassName}
          dangerouslySetInnerHTML={{ __html: getQuestionStemHtml(question) }}
        />
      ) : null}
      {imageSrc ? (
        <div className={imageWrapClassName}>
          <img src={imageSrc} alt="" loading="lazy" className={imageClassName} />
        </div>
      ) : null}
    </>
  )
}

export default QuestionStemBlock
