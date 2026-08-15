import { useRef } from 'react'
import { OTP_LENGTH } from '../../constants/auth'

function OtpInput({ digits, onChange, disabled = false, variant = 'default' }) {
  const inputsRef = useRef([])
  const isPasswordReset = variant === 'password-reset'
  const boxClassName = isPasswordReset
    ? 'h-11 w-10 shrink-0 rounded-xl border border-transparent bg-[#EEF2F3] text-center text-lg font-bold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/25 sm:h-[52px] sm:w-[52px] sm:text-xl'
    : 'h-12 w-10 shrink-0 rounded-xl border border-[#D9DEE0] bg-[#EEF2F3] text-center text-lg font-bold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/30 sm:h-14 sm:w-12 sm:text-xl'
  const gapClassName = isPasswordReset ? 'gap-1.5 sm:gap-2.5' : 'gap-1.5 sm:gap-3'

  const handleChange = (index, value) => {
    const sanitized = value.replace(/\D/g, '').slice(-1)
    onChange(index, sanitized)

    if (sanitized && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    pasted.split('').forEach((char, index) => onChange(index, char))
    if (pasted.length === OTP_LENGTH) {
      inputsRef.current[OTP_LENGTH - 1]?.focus()
    }
  }

  return (
    <div dir="ltr" className={`flex max-w-full items-center justify-center ${gapClassName}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className={boxClassName}
        />
      ))}
    </div>
  )
}

export default OtpInput
