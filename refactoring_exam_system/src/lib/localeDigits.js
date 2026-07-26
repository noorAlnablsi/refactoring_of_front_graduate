const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Convert ASCII digits ↔ Arabic-Indic according to `isArabic`. */
export function localizeDigitsInString(input, isArabic) {
  const str = String(input ?? '')
  if (isArabic) {
    return str.replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)])
  }
  return str.replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
}
