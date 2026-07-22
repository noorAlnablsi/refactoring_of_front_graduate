import { Mic, Signal, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function SystemStatusCard({ icon: Icon, title, value, ok }) {
  return (
    <div className="flex min-h-[96px] flex-col rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            ok ? 'bg-[#E8F7F6] text-[#2AA8A2]' : 'bg-[#F1F5F9] text-[#94A3B8]'
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <p className="text-xs font-bold text-[#64748B]">{title}</p>
      </div>
      <p className={`mt-3 text-sm font-extrabold leading-6 ${ok ? 'text-[#059669]' : 'text-[#94A3B8]'}`}>
        {value}
      </p>
    </div>
  )
}

const DEFAULT_CHECKS = {
  micOk: false,
  connectionOk: true,
  cameraOk: false,
  faceOk: false,
  lightingOk: false,
  positionOk: false,
}

function SystemStatusGrid({ checks = DEFAULT_CHECKS, proctoringEnabled }) {
  const { t } = useTranslation('student')

  if (!proctoringEnabled) return null

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SystemStatusCard
        icon={Mic}
        title={t('entry.statusMic')}
        value={checks.micOk ? t('entry.statusMicOk') : t('entry.statusPending')}
        ok={checks.micOk}
      />
      <SystemStatusCard
        icon={Signal}
        title={t('entry.statusConnection')}
        value={checks.connectionOk ? t('entry.statusConnectionOk') : t('entry.statusConnectionPending')}
        ok={checks.connectionOk}
      />
      <SystemStatusCard
        icon={UserRound}
        title={t('entry.statusDistance')}
        value={checks.positionOk ? t('entry.statusDistanceOk') : t('entry.statusDistancePending')}
        ok={checks.positionOk}
      />
    </div>
  )
}

export default SystemStatusGrid
