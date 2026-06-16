function RegisterProgress({ activeStep }) {
  return (
    <div dir="rtl" className="mb-8 flex items-center gap-3">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`h-2 flex-1 rounded-full ${
            step <= activeStep ? 'bg-[#2AA8A2]' : 'bg-[#D9DEE0]'
          }`}
        />
      ))}
    </div>
  )
}

export default RegisterProgress
