import { CheckCircle2, CircleDot, SunMedium, Video } from 'lucide-react'

import { useTranslation } from 'react-i18next'

import CameraPreview from '../../proctoring/CameraPreview'



function StatusRow({ ok, okLabel, pendingLabel, icon: Icon }) {

  return (

    <div className="flex items-center justify-between gap-3">

      <div className="flex items-center gap-2 text-start">

        <Icon className={`h-3.5 w-3.5 ${ok ? 'text-emerald-400' : 'text-white/70'}`} />

        <span className="text-[11px] font-semibold text-white/90">{ok ? okLabel : pendingLabel}</span>

      </div>

      {ok ? (

        <CheckCircle2 className="h-4 w-4 text-emerald-400" />

      ) : (

        <CircleDot className="h-4 w-4 text-white/40" />

      )}

    </div>

  )

}



function VerificationStatusPanel({ checks }) {

  const { t } = useTranslation('student')



  return (

    <div className="absolute bottom-3 start-3 end-3 rounded-xl bg-black/55 px-3 py-2.5 backdrop-blur-sm sm:end-auto sm:w-56">

      <div className="space-y-2">

        <StatusRow

          icon={Video}

          ok={checks.cameraOk}

          okLabel={t('entry.cameraVerified')}

          pendingLabel={t('entry.cameraPending')}

        />

        <StatusRow

          icon={CheckCircle2}

          ok={checks.faceOk}

          okLabel={t('entry.faceVerified')}

          pendingLabel={t('entry.facePending')}

        />

        <StatusRow

          icon={SunMedium}

          ok={checks.lightingOk}

          okLabel={t('entry.lightingOk')}

          pendingLabel={t('entry.lightingPending')}

        />

      </div>

    </div>

  )

}



function ExamEntryCameraCard({

  stream,

  live,

  checks,

  cameraError,

  onRetryCamera,

  proctoringEnabled,

  onVideoRef,

}) {

  const { t } = useTranslation('student')



  return (

    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">

      <div className="mb-4 flex items-center justify-between gap-3">

        <h2 className="text-base font-extrabold text-[#2A3433]">{t('entry.cameraTitle')}</h2>

        {proctoringEnabled ? (

          <span

            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${

              live ? 'bg-emerald-50 text-emerald-700' : 'bg-[#F1F5F9] text-[#64748B]'

            }`}

          >

            <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500' : 'bg-[#94A3B8]'}`} />

            {live ? t('entry.liveNow') : t('entry.cameraIdle')}

          </span>

        ) : (

          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-bold text-[#64748B]">

            {t('entry.proctoringOff')}

          </span>

        )}

      </div>



      {proctoringEnabled ? (

        <>

          <div className="relative overflow-hidden rounded-2xl bg-[#0F172A]">

            <div className="aspect-[16/10] w-full">

              {stream ? (

                <CameraPreview

                  stream={stream}

                  className="h-full w-full object-cover"

                  onVideoRef={onVideoRef}

                />

              ) : (

                <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">

                  <Video className="h-10 w-10 text-white/40" />

                  <p className="text-sm text-white/70">{t('entry.cameraWaiting')}</p>

                  {cameraError ? (

                    <button

                      type="button"

                      onClick={onRetryCamera}

                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"

                    >

                      {t('entry.retryCamera')}

                    </button>

                  ) : null}

                </div>

              )}

            </div>

            <VerificationStatusPanel checks={checks} />

          </div>

          {cameraError ? (

            <p className="mt-3 text-sm font-semibold text-[#DC2626]">{cameraError}</p>

          ) : null}

        </>

      ) : (

        <p className="rounded-xl bg-[#F6F8F9] px-4 py-6 text-sm leading-7 text-[#64748B]">

          {t('entry.proctoringOffHint')}

        </p>

      )}

    </section>

  )

}



export default ExamEntryCameraCard


