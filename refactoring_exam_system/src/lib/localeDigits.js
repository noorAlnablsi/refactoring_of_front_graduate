const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'


export function localizeDigitsInString(input, isArabic) {
  const str = String(input ?? '')
  if (isArabic) {
    return str.replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)])
  }
  return str.replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
}
