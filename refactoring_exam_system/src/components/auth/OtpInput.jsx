import { useRef } from 'react'
import { OTP_LENGTH } from '../../constants/auth'

function OtpInput({ digits, onChange, disabled = false }) {
  const inputsRef = useRef([])

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
    <div dir="ltr" className="flex items-center justify-center gap-3">
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
          className="h-14 w-12 rounded-xl border border-[#D9DEE0] bg-[#EEF2F3] text-center text-xl font-bold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/30"
        />
      ))}
    </div>
  )
}

export default OtpInput
